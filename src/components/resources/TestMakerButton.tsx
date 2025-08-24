
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTest } from '@/ai/flows/test-maker-flow';
import { generateMcqTest } from '@/ai/flows/mcq-test-maker-flow';
import type { Resource } from '@/types';
import jsPDF from 'jspdf';

type TestMakerButtonProps = {
  resource: Resource;
  disabled?: boolean;
};

export default function TestMakerButton({ resource, disabled = false }: TestMakerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
  const { toast } = useToast();
  
  const createPdf = (testContent: string, title: string) => {
    const doc = new jsPDF({
      unit: 'pt',
      lineHeight: 1.0,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 0;
    
    // -- Header --
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Educational Notes', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    y = 55;
    doc.text(`Chapter Name: ${title}`, margin, y);
    doc.text('Sponsored by Pravin Khachane & Mangesh Shete Sir', pageWidth - margin, y, { align: 'right' });
    
    y += 15;
    
    // -- Test Content --
    y += 10;
    const lines = testContent.split('\n');

    const checkPageBreak = () => {
      if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = margin;
      }
    }

    for(const line of lines) {
        if (line.trim() === '') {
            y += 10; // Add space
            checkPageBreak();
            continue;
        }

        checkPageBreak();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        if (line.match(/^Section [A-D]:/) || line.match(/Answer Key:/) || line.match(/^Ques\. [0-9]+\./)) {
          doc.setFont('helvetica', 'bold');
        }

        const splitLines = doc.splitTextToSize(line, pageWidth - margin * 2);
        doc.text(splitLines, margin, y);
        y += splitLines.length * 11 * 1.0;
        y += 4;
    }
    
    // -- Footer --
    const finalY = doc.internal.pageSize.getHeight() - 30;
    doc.setLineWidth(1);
    doc.line(margin, finalY - 10, pageWidth - margin, finalY - 10);
    doc.setFontSize(10);
    doc.text(`Date Of creation: ${new Date().toLocaleDateString()}`, margin, finalY);
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
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">AI Test Generation</h4>
      <Button
        variant="secondary"
        onClick={handleGenerateTest}
        disabled={disabled || loading || mcqLoading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Generating...' : 'Test Make (Regular)'}
      </Button>
      <Button
        variant="outline"
        onClick={handleGenerateMcqTest}
        disabled={disabled || loading || mcqLoading}
      >
        {mcqLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        {mcqLoading ? 'Generating...' : 'Test Make (MCQ)'}
      </Button>
    </div>
  );
}
