
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTest } from '@/ai/flows/test-maker-flow';
import type { Resource } from '@/types';
import jsPDF from 'jspdf';

type TestMakerButtonProps = {
  resource: Resource;
  disabled?: boolean;
};

export default function TestMakerButton({ resource, disabled = false }: TestMakerButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTest = async () => {
    setLoading(true);
    toast({
      title: 'Generating Test...',
      description: 'The AI is creating your personalized test. This may take a moment.',
    });

    try {
      const result = await generateTest({
        title: resource.title,
        content: resource.content,
        class: resource.class,
        subject: resource.subject,
      });
      
      const doc = new jsPDF({
        unit: 'pt', // Use points for font size consistency
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 36; // Approx 0.5 inch
      
      // -- Header --
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('Educational Notes', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sponsored by Pravin Khachane & Mangesh Shete Sir', pageWidth - margin, 55, { align: 'right' });

      // -- Title & Info --
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Test for: ${resource.title}`, pageWidth / 2, 80, { align: 'center' });
      doc.text('Total Marks: 20', margin, 100);
      doc.text('Time: 1hr', pageWidth - margin, 100, { align: 'right' });

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, 110, pageWidth - margin, 110); 
      
      // -- Test Content --
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Split the text to fit the page width with margins
      const splitText = doc.splitTextToSize(result.testContent, pageWidth - margin * 2);
      
      // Add text with auto page breaks
      doc.text(splitText, margin, 130);

      const safeTitle = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle}_test.pdf`);
      
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

  return (
    <Button
    variant="secondary"
    onClick={handleGenerateTest}
    disabled={disabled || loading}
    >
    {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
        <FileText className="mr-2 h-4 w-4" />
    )}
    {loading ? 'Generating...' : 'Test Maker'}
    </Button>
  );
}
