
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMcqTest } from '@/ai/flows/mcq-test-maker-flow';
import { generateRegularTest } from '@/ai/flows/test-maker-flow';
import type { Resource } from '@/types';
import jsPDF from 'jspdf';
import Link from 'next/link';

type TestMakerButtonProps = {
  resource: Resource;
  disabled?: boolean;
};

export default function TestMakerButton({ resource, disabled = false }: TestMakerButtonProps) {
  const [mcqLoading, setMcqLoading] = useState(false);
  const [regularLoading, setRegularLoading] = useState(false);
  const { toast } = useToast();
  
 const createPdf = (testContent: string, title: string) => {
    if (!testContent) {
        console.error("Test content is empty or undefined.");
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to generate PDF because the test content was empty.',
        });
        return;
    }
     
    const doc = new jsPDF({
      unit: 'pt',
      lineHeight: 1.5,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    const drawPageBorders = () => {
        doc.setLineWidth(1);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
        doc.setLineWidth(0.5);
        doc.rect(25, 25, pageWidth - 50, pageHeight - 50);
    }
    
    // Initial Border
    drawPageBorders();

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Educational Notes', pageWidth / 2, 60, { align: 'center' });
    y = 75;
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    y += 20;

    const testLinesForHeader = testContent.split('\n');
    const marksLineFromContent = testLinesForHeader.find(line => line.toLowerCase().includes('marks')) || 'Total Marks: 20';
    const timeText = 'Time: 1 Hr.';

    doc.text(`Chapter: ${title}`, margin, y);
    y += 15;
    
    // Use the marks line from content if available, otherwise default.
    doc.text(marksLineFromContent, margin, y);
    
    doc.text(timeText, pageWidth - margin, y, { align: 'right' });
    
    y += 20;
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 25;
    
    // --- Test Content ---
    const lines = testContent.split('\n');

    const checkPageBreak = (neededHeight = 20) => {
      if (y + neededHeight > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          drawPageBorders();
          y = margin + 10;
      }
    }

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        checkPageBreak();

        // Bold section headers
        const isSectionHeader = line.match(/^Section [A-D]:/i) || line.match(/^Answer Key:/i) || line.match(/Multiple Choice Questions/i) || line.match(/Short Answer Questions/i) || line.match(/Long Answer Questions/i);
        const hasMarks = /\(\d+ Marks\)/.test(line);

        if (isSectionHeader) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            y += (i === 0 ? 0 : 10);
            checkPageBreak();
            if (hasMarks) {
              const parts = line.split('(');
              doc.text(parts[0], margin, y);
              doc.text(`(${parts[1]}`, pageWidth - margin, y, { align: 'right' });
            } else {
              doc.text(line, pageWidth / 2, y, { align: 'center'});
            }
            y += 20;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            continue;
        }

        // Handle MCQ options in two columns
        if (line.match(/^[A-D]\)/) && lines[i+1]?.match(/^[A-D]\)/)) {
            const option1 = line;
            const option2 = lines[i+1]?.trim() || '';
            
            if (option1.startsWith("A)") && option2.startsWith("B)")) {
                const splitLines1 = doc.splitTextToSize(option1, contentWidth / 2 - 5);
                const splitLines2 = doc.splitTextToSize(option2, contentWidth / 2 - 5);
                checkPageBreak(Math.max(splitLines1.length, splitLines2.length) * 12);
                doc.text(splitLines1, margin, y);
                doc.text(splitLines2, margin + contentWidth / 2, y);
                y += Math.max(splitLines1.length, splitLines2.length) * 12 + 4;
                i++; // Skip next line since it's processed
                continue;
            }
             if (option1.startsWith("C)") && option2.startsWith("D)")) {
                const splitLines1 = doc.splitTextToSize(option1, contentWidth / 2 - 5);
                const splitLines2 = doc.splitTextToSize(option2, contentWidth / 2 - 5);
                checkPageBreak(Math.max(splitLines1.length, splitLines2.length) * 12);
                doc.text(splitLines1, margin, y);
                doc.text(splitLines2, margin + contentWidth / 2, y);
                y += Math.max(splitLines1.length, splitLines2.length) * 12 + 4;
                i++; // Skip next line since it's processed
                continue;
            }
        }

        // Handle questions, other options, and answers
        const splitLines = doc.splitTextToSize(line, contentWidth);
        checkPageBreak(splitLines.length * 12);
        doc.text(splitLines, margin, y);
        y += splitLines.length * 12 + 4;
    }
    
    // -- Footer --
    const finalY = doc.internal.pageSize.getHeight() - 30;
    doc.setLineWidth(0.5);
    doc.line(margin, finalY - 10, pageWidth - margin, finalY - 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Date Of creation: ${new Date().toLocaleDateString()}`, margin, finalY);
    doc.text(`- Sponsored by Pravin Khachane and Mangesh Shete -`, pageWidth / 2, finalY, { align: 'center' });
    doc.text(`Time of Creation: ${new Date().toLocaleTimeString()}`, pageWidth - margin, finalY, { align: 'right' });

    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeTitle}_test.pdf`);
  }

  const handleGenerateMcqTest = async () => {
    setMcqLoading(true);
    toast({
      title: 'Generating MCQ Test...',
      description: 'The AI is creating your MCQ-only test. This may take a moment.',
    });

    try {
      const result = await generateMcqTest({
        title: resource.title,
        content: resource.content,
        class: resource.class,
        subject: resource.subject,
        stream: resource.stream,
      });
      
      createPdf(result.testContent, `${resource.title}`);
      
      toast({
        title: 'Success!',
        description: 'Your MCQ test has been generated and is downloading now.',
      });

    } catch (error) {
      console.error('Error generating MCQ test:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the MCQ test. The AI might be busy. Please try again later.',
      });
    } finally {
      setMcqLoading(false);
    }
  };
  
  const handleGenerateRegularTest = async () => {
    setRegularLoading(true);
    toast({
      title: 'Generating Regular Test...',
      description: 'The AI is creating your test paper. This may take a moment.',
    });

    try {
      const result = await generateRegularTest({
        title: resource.title,
        content: resource.content,
        class: resource.class,
        subject: resource.subject,
        stream: resource.stream,
      });
      
      createPdf(result.testContent, `${resource.title}`);
      
      toast({
        title: 'Success!',
        description: 'Your test paper has been generated and is downloading now.',
      });

    } catch (error) {
      console.error('Error generating regular test:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the test paper. The AI might be busy. Please try again later.',
      });
    } finally {
      setRegularLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">AI Tools</h4>
             <Button asChild variant="ghost" className="w-full justify-start bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-800 dark:text-yellow-200 dark:hover:text-yellow-100">
                <Link href={`/ask?resourceId=${resource.id}&title=${encodeURIComponent(resource.title)}`}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ask a Question
                </Link>
            </Button>
             <Button
                variant="secondary"
                onClick={handleGenerateRegularTest}
                disabled={disabled || regularLoading}
                className="w-full bg-orange-400/20 hover:bg-orange-400/30 text-orange-800 dark:text-orange-200 dark:hover:text-orange-100 border-orange-400/50"
            >
                {regularLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {regularLoading ? 'Generating...' : 'Regular Test'}
            </Button>
            <Button
                variant="secondary"
                onClick={handleGenerateMcqTest}
                disabled={disabled || mcqLoading}
                className="w-full bg-green-400/20 hover:bg-green-400/30 text-green-800 dark:text-green-200 dark:hover:text-green-100 border-green-400/50"
            >
                {mcqLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {mcqLoading ? 'Generating...' : 'Generate MCQ Test'}
            </Button>
        </div>
    </div>
  );
}
