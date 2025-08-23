
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
        unit: 'pt',
        lineHeight: 1,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 36;
      let y = 0;
      
      // -- Header --
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('Educational Notes', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      y = 55;
      doc.text('Sponsored by Pravin Khachane & Mangesh Shete Sir', pageWidth - margin, y, { align: 'right' });
      
      doc.setFontSize(12);
      doc.text(`Chapter Name: ${resource.title}`, margin, y);
      y += 20;
      doc.text('Total Marks: 20', margin, y);
      doc.text('Time: 1 hr', pageWidth - margin, y, { align: 'right' });

      y += 10;
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y); 
      
      // -- Test Content --
      y += 20; // Initial space before first section
      const lines = result.testContent.split('\n');

      const processSection = (title: string, marks: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title, pageWidth / 2, y, { align: 'center' });
        y += 20;
      }
      
      const processQuestionHeader = (text: string, marks: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(text, margin, y);
        doc.text(marks, pageWidth - margin, y, { align: 'right' });
        y+=5;
      }
      
      const processLine = (line: string) => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
        }

        const isMCQ = /^[0-9]+\..*[A-D]\)/.test(line);

        if (isMCQ) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const questionMatch = line.match(/^([0-9]+\..*?)( A\))/);
            if(questionMatch) {
              const questionText = questionMatch[1];
              const questionLines = doc.splitTextToSize(questionText, pageWidth - margin * 2);
              doc.text(questionLines, margin, y);
              y += questionLines.length * 11;

              const optionsMatch = line.match(/(A\).*?B\).*?C\).*?D\).*)/);
              if(optionsMatch) {
                const options = optionsMatch[0].split(/(?=[A-D]\))/).map(o => o.trim());
                const halfWidth = (pageWidth / 2) - margin;
                const optionA = doc.splitTextToSize(options[0], halfWidth - 10);
                const optionB = doc.splitTextToSize(options[1], halfWidth - 10);
                const optionC = doc.splitTextToSize(options[2], halfWidth - 10);
                const optionD = doc.splitTextToSize(options[3], halfWidth - 10);
                
                doc.text(optionA, margin + 15, y);
                doc.text(optionB, pageWidth / 2 + 5, y);
                y += Math.max(optionA.length, optionB.length) * 11;

                doc.text(optionC, margin + 15, y);
                doc.text(optionD, pageWidth / 2 + 5, y);
                y += Math.max(optionC.length, optionD.length) * 11;
              }
            }
        } else {
            const questionLines = doc.splitTextToSize(line, pageWidth - margin * 2);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(questionLines, margin, y);
            y += questionLines.length * 11;
        }
        y += 6; // Space after each question
      };

      let currentSection = '';
      for(const line of lines) {
          if (line.trim() === '') {
              y += 11; // Add space between sections
              continue;
          }

          if (line.startsWith('Section A:')) {
            currentSection = 'A';
            processSection('Section A', '');
            processQuestionHeader('Ques. 1 Multiple Choice Questions', '(4 Marks)');
            continue;
          } else if (line.startsWith('Section B:')) {
            currentSection = 'B';
            processSection('Section B', '');
            processQuestionHeader('Ques. 2 Short Answer Questions', '(6 Marks)');
            continue;
          } else if (line.startsWith('Section C:')) {
            currentSection = 'C';
            processSection('Section C', '');
            processQuestionHeader('Ques. 3 Medium Answer Questions', '(6 Marks)');
            continue;
          } else if (line.startsWith('Section D:')) {
            currentSection = 'D';
            processSection('Section D', '');
            processQuestionHeader('Ques. 4 Long Answer Question', '(4 Marks)');
            continue;
          } else if (line.startsWith('Answer Key')) {
              break; // Stop processing before the answer key
          }

          if (currentSection) {
            processLine(line);
          }
      }
      
      // -- Footer --
      const creationDate = new Date().toLocaleDateString();
      const creationTime = new Date().toLocaleTimeString();
      const finalY = doc.internal.pageSize.getHeight() - 30;
      doc.setLineWidth(1);
      doc.line(margin, finalY - 10, pageWidth - margin, finalY - 10);
      doc.setFontSize(10);
      doc.text(`Date of creation: ${creationDate}`, margin, finalY);
      doc.text(`Time of Creation: ${creationTime}`, pageWidth - margin, finalY, { align: 'right' });


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
