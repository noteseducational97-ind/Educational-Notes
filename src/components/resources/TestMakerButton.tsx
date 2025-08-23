
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
      
      const doc = new jsPDF();
      
      // Add Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Educational Notes', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Test for: ${resource.title}`, 105, 30, { align: 'center' });
      doc.line(15, 35, 195, 35); // Horizontal line

      // Add Test Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      const splitText = doc.splitTextToSize(result.testContent, 180);
      doc.text(splitText, 15, 45);
      
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
