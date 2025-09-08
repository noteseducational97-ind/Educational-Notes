
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { generateTest, TestGeneratorOutput } from '@/ai/flows/test-generator-flow';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function TestGeneratorPage() {
  const searchParams = useSearchParams();
  const content = searchParams.get('content') || '';
  const { toast } = useToast();

  const [testType, setTestType] = useState<'MCQ' | 'Regular'>('MCQ');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestGeneratorOutput | null>(null);

  const handleGenerateTest = async () => {
    if (!content) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No content provided to generate a test from.',
      });
      return;
    }
    setLoading(true);
    setTestResult(null);
    try {
      const result = await generateTest({
        resourceContent: content,
        testType: testType,
        questionCount: 5,
      });
      setTestResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Test Generation Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">AI Test Generator</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Generate a quiz from the resource content to test your knowledge.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Options</CardTitle>
              <CardDescription>Choose the type of test you want to generate.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-8">
              <RadioGroup value={testType} onValueChange={(value: 'MCQ' | 'Regular') => setTestType(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MCQ" id="mcq" />
                  <Label htmlFor="mcq">Multiple Choice (MCQ)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Regular" id="regular" />
                  <Label htmlFor="regular">Question & Answer</Label>
                </div>
              </RadioGroup>
              <Button onClick={handleGenerateTest} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate Test
              </Button>
            </CardContent>
          </Card>

          {loading && <div className="flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}

          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle>{testType} Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {testResult.mcqQuestions?.map((q, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>Question {index + 1}: {q.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {q.options.map((opt, i) => (
                            <p key={i} className={`p-2 rounded-md ${opt === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                              {i + 1}. {opt}
                            </p>
                          ))}
                          <p className="font-semibold pt-2">Correct Answer: <span className="text-primary">{q.correctAnswer}</span></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                   {testResult.regularQuestions?.map((q, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>Question {index + 1}: {q.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          <p className="font-semibold pt-2">Answer: <span className="text-primary font-normal">{q.answer}</span></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
