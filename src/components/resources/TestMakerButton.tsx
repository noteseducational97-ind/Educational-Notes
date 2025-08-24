
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
        stream: resource.stream,
      });
      
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
      doc.text(`Chapter Name: ${resource.title}`, margin, y);
      doc.text('Sponsored by Pravin Khachane & Mangesh Shete Sir', pageWidth - margin, y, { align: 'right' });
      
      y += 15;
      doc.text('Total Marks: 20', margin, y);
      doc.text('Time: 1 hr', pageWidth - margin, y, { align: 'right' });

      y += 15;
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y); 
      
      // -- Test Content --
      y += 10;
      const lines = result.testContent.split('\n');

      const checkPageBreak = () => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
        }
      }
      
      const processSection = (title: string, marks: string) => {
        y+= 20;
        checkPageBreak();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title, pageWidth / 2, y, { align: 'center' });
        if (marks) {
          doc.text(marks, pageWidth - margin, y-5, { align: 'right' });
        }
        y += 20;
      }
      
      const processMCQ = (line: string) => {
          checkPageBreak();
          const questionMatch = line.match(/^([0-9]+\..*?)( A\))/);
          if (questionMatch) {
              const questionText = questionMatch[1].trim();
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
              const questionLines = doc.splitTextToSize(questionText, pageWidth - (margin * 2));
              doc.text(questionLines, margin, y);
              y += (questionLines.length * 11 * 1.0);

              const optionsMatch = line.match(/(A\).*)/);
              if (optionsMatch) {
                  const allOptions = optionsMatch[1];
                  const options = allOptions.split(/(?=[B-D]\))/).map(o => o.trim());

                  const optionA = options[0] || '';
                  const optionB = options[1] || '';
                  const optionC = options[2] || '';
                  const optionD = options[3] || '';
                  
                  const halfWidth = (pageWidth / 2) - margin;

                  doc.setFont('helvetica', 'normal');
                  doc.text(doc.splitTextToSize(optionA, halfWidth - 15), margin + 15, y);
                  doc.text(doc.splitTextToSize(optionB, halfWidth - 15), pageWidth / 2 + 5, y);
                  
                  const aHeight = doc.getTextDimensions(doc.splitTextToSize(optionA, halfWidth - 15)).h;
                  const bHeight = doc.getTextDimensions(doc.splitTextToSize(optionB, halfWidth - 15)).h;
                  y += Math.max(aHeight, bHeight) + 5;
                  checkPageBreak();

                  doc.text(doc.splitTextToSize(optionC, halfWidth - 15), margin + 15, y);
                  doc.text(doc.splitTextToSize(optionD, halfWidth - 15), pageWidth / 2 + 5, y);

                  const cHeight = doc.getTextDimensions(doc.splitTextToSize(optionC, halfWidth - 15)).h;
                  const dHeight = doc.getTextDimensions(doc.splitTextToSize(optionD, halfWidth - 15)).h;
                  y += Math.max(cHeight, dHeight) + 10;

              }
          }
      };
      
      const processLine = (line: string, isBold: boolean = false) => {
          checkPageBreak();
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          doc.setFontSize(11);
          const questionLines = doc.splitTextToSize(line, pageWidth - margin * 2);
          doc.text(questionLines, margin, y);
          y += questionLines.length * 11 * 1.0;
          y += 4;
      };

      let currentSection = '';
      for(const line of lines) {
          if (line.trim() === '') {
              y += 5; // Add space between sections
              continue;
          }

          if (line.startsWith('Section A:')) {
            currentSection = 'A';
            processSection('Section A', '(4 Marks)');
            processLine('Ques. 1 Multiple Choice Questions (MCQs)', true);
            continue;
          } else if (line.startsWith('Section B:')) {
            currentSection = 'B';
            processSection('Section B', '(6 Marks)');
            processLine('Ques. 2. Short Answer Questions', true);
            continue;
          } else if (line.startsWith('Section C:')) {
            currentSection = 'C';
            processSection('Section C', '(6 Marks)');
            processLine('Ques. 3. Answer The following Question (Any 2)', true);
            continue;
          } else if (line.startsWith('Section D:')) {
            currentSection = 'D';
            processSection('Section D', '(4 Marks)');
            processLine('Ques. 4. Long Answer Question (Any 1)', true);
            continue;
          } else if (line.startsWith('Answer Key')) {
              break;
          }

          if (currentSection === 'A') {
              processMCQ(line);
          } else if (currentSection) {
              processLine(line);
          }
      }
      
      // -- Footer --
      const finalY = doc.internal.pageSize.getHeight() - 30;
      doc.setLineWidth(1);
      doc.line(margin, finalY - 10, pageWidth - margin, finalY - 10);
      doc.setFontSize(10);
      doc.text(`Date Of creation: ${new Date().toLocaleDateString()}`, margin, finalY);
      doc.text(`Time of Creation: ${new Date().toLocaleTimeString()}`, pageWidth - margin, finalY, { align: 'right' });


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
    {loading ? 'Generating...' : 'Test make (regular)'}
    </Button>
  );
}
