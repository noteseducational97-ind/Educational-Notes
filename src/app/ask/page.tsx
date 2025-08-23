
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/question-answer-flow';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Lightbulb } from 'lucide-react';
import { getResourceById, Resource } from '@/lib/firebase/resources';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const formSchema = z.object({
  question: z.string().min(10, 'Your question must be at least 10 characters.'),
});

export default function AskPage() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [resource, setResource] = useState<Resource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  const resourceId = searchParams.get('resourceId');

  const loadResource = useCallback(async () => {
    if (!resourceId) {
        setLoadingResource(false);
        toast({
            variant: 'destructive',
            title: 'No Resource Selected',
            description: 'Please go back and select a resource to ask a question about.'
        });
        return;
    }
    setLoadingResource(true);
    try {
        const fetchedResource = await getResourceById(resourceId);
        if (!fetchedResource || (fetchedResource.visibility === 'private' && !user)) {
             toast({
                variant: 'destructive',
                title: 'Resource not accessible',
                description: 'The selected resource could not be found or you do not have permission to view it.'
            });
            setResource(null);
        } else {
            setResource(fetchedResource);
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error loading resource',
            description: 'Could not fetch the details of the study material.'
        });
    } finally {
        setLoadingResource(false);
    }
  }, [resourceId, toast, user]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setAnswer('');
    if (!resource) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Resource not loaded. Please try again.',
        });
        setLoading(false);
        return;
    }
    try {
      const result = await answerQuestion({
        question: values.question,
        resourceTitle: resource.title,
        resourceContent: resource.content,
      });
      setAnswer(result.answer);
      toast({
        title: 'Answer Received!',
        description: 'The AI has responded to your question.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating answer',
        description: 'The AI might be busy. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }

  if(loadingResource) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <Lightbulb className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-4xl font-bold mt-4">Ask an Expert</h1>
                <p className="text-muted-foreground mt-2">
                  Have a question about a specific topic? Our AI expert will find the answer for you based on the selected material.
                </p>
              </div>
            
            {resource ? (
                 <Card className="w-full shadow-lg">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                            <CardTitle>Ask about: <span className="text-primary">{resource.title}</span></CardTitle>
                            <CardDescription>Type your question below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Question</FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="e.g., What is the law of conservation of energy?" {...field} rows={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                    Ask Question
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                 </Card>
            ): (
                 <Card className="w-full shadow-lg text-center p-8">
                    <CardTitle>Resource Not Available</CardTitle>
                    <CardDescription>Please return to the downloads page and select a resource to ask a question.</CardDescription>
                </Card>
            )}

              {answer && (
                <div className="mt-8">
                     <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle className="font-bold">AI Generated Answer</AlertTitle>
                        <AlertDescription className="prose prose-sm dark:prose-invert max-w-none">
                           <p>{answer}</p>
                        </AlertDescription>
                    </Alert>
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
}
