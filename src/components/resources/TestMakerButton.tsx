
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTest } from '@/ai/flows/test-maker-flow';
import { generateMcqTest } from '@/ai/flows/mcq-test-maker-flow';
import type { Resource } from '@/types';
import jsPDF from 'jspdf';
import Link from 'next/link';

type TestMakerButtonProps = {
  resource: Resource;
  disabled?: boolean;
};

export default function TestMakerButton({ resource, disabled = false }: TestMakerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
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

    const drawWatermark = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(60);
        doc.setTextColor(220, 220, 220); // A light gray color
        doc.text(
            'Educational Notes', 
            pageWidth / 2, 
            pageHeight / 2, 
            { align: 'center', angle: -45 }
        );
        doc.setTextColor(0, 0, 0); // Reset text color
    };
    
    const drawBorder = () => {
        doc.setLineWidth(1);
        doc.rect(margin - 15, margin - 15, contentWidth + 30, pageHeight - (margin - 15) * 2);
    }
    
    // Initial Border & Watermark
    drawBorder();
    drawWatermark();


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
    const marksLineFromContent = testLinesForHeader.find(line => line.toLowerCase().includes('marks:')) || 'Total Marks: 20';
    const timeText = title.toLowerCase().includes("mcq") ? 'Time: 1 Hr.' : 'Time: 1 Hr.';

    doc.text(`Chapter: ${title}`, margin, y);
    y += 15;
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
          drawBorder();
          drawWatermark();
          y = margin + 10;
      }
    }

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        checkPageBreak();

        // Bold section headers
        if (line.match(/^Section [A-D]:/i) || line.match(/^Answer Key:/i)) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            y += (i === 0 ? 0 : 10);
            checkPageBreak();
            doc.text(line, pageWidth / 2, y, { align: 'center'});
            y += 20;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            continue;
        }

        // Handle questions, options, and answers
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


  const handleGenerateTest = async () => {
    setLoading(true);
    toast({
      title: 'Generating Regular Test...',
      description: 'The AI is creating your personalized test. This may take a moment.',
    });

    try {
      const result = await generateTest({
        title: resource.title,
        content: resource.content,
        class: resource.class,
        subject: resource.subject,
        stream: resource.stream,
      });
      
      createPdf(result.testContent, resource.title);
      
      toast({
        title: 'Success!',
        description: 'Your test has been generated and is downloading now.',
      });

    } catch (error) {
      console.error('Error generating test:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the test. The AI might be busy. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

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
      
      createPdf(result.testContent, `${resource.title} (MCQ)`);
      
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
        </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
            variant="secondary"
            onClick={handleGenerateTest}
            disabled={disabled || loading || mcqLoading}
            className="flex-col h-auto py-2 bg-orange-400/20 hover:bg-orange-400/30 text-orange-800 dark:text-orange-200 dark:hover:text-orange-100"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            <span className="text-xs font-normal mt-1">{loading ? 'Generating...' : 'Regular Test'}</span>
        </Button>
        <Button
            variant="outline"
            onClick={handleGenerateMcqTest}
            disabled={disabled || loading || mcqLoading}
            className="flex-col h-auto py-2 bg-green-400/20 hover:bg-green-400/30 text-green-800 dark:text-green-200 dark:hover:text-green-100 border-green-400/50"
        >
            {mcqLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            <span className="text-xs font-normal mt-1">{mcqLoading ? 'Generating...' : 'MCQ Test'}</span>
        </Button>
      </div>
    </div>
  );
}
