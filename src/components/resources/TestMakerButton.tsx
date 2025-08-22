
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTest } from '@/ai/flows/test-maker-flow';
import type { Resource } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TestMakerButtonProps = {
  resource: Resource;
  disabled?: boolean;
};

export default function TestMakerButton({ resource, disabled = false }: TestMakerButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleGenerateTest = async () => {
    if (!user) {
        setShowLoginDialog(true);
        return;
    }

    setLoading(true);
    toast({
      title: 'Generating Test...',
      description: 'Please wait while we create your test. This may take a moment.',
    });

    try {
      const result = await generateTest({
        title: resource.title,
        content: resource.content,
      });
      
      const doc = new jsPDF();
      
      // Add content to the PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Test for: ${resource.title}`, 10, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      // Split the text into lines to handle wrapping
      const splitText = doc.splitTextToSize(result.testContent, 180);
      doc.text(splitText, 10, 30);
      
      doc.save(`${resource.title.replace(/ /g, '_')}_Test.pdf`);
      
      toast({
        title: 'Success!',
        description: 'Your test has been generated and is downloading now.',
      });

    } catch (error) {
      console.error('Error generating test:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the test. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                <AlertDialogDescription>
                You need to be signed in to generate a test. Please sign in to continue.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
