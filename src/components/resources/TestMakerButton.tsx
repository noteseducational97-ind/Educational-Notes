
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTest } from '@/ai/flows/test-maker-flow';
import type { Resource } from '@/types';

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
      description: 'Please wait while we create your test. This may take a moment.',
    });

    try {
      const result = await generateTest({
        title: resource.title,
        content: resource.content,
      });
      
      const blob = new Blob([result.testContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title.replace(/ /g, '_')}_Test.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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
