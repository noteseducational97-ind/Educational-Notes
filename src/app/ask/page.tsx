
'use client';

import { useState, useEffect } from 'react';
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
import { getResources, Resource } from '@/lib/firebase/resources';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  resourceId: z.string().min(1, 'Please select a resource.'),
  question: z.string().min(10, 'Your question must be at least 10 characters.'),
});

export default function AskPage() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceId: '',
      question: '',
    },
  });

  useEffect(() => {
    const resourceId = searchParams.get('resourceId');
    if(resourceId) {
        form.setValue('resourceId', resourceId);
    }
  }, [searchParams, form]);
  
  useEffect(() => {
    async function loadResources() {
      setLoadingResources(true);
      try {
        const fetchedResources = await getResources({ includePrivate: !!user });
        setResources(fetchedResources.filter(r => !r.isComingSoon));
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Error loading resources',
              description: 'Could not fetch the list of study materials.'
          });
      } finally {
        setLoadingResources(false);
      }
    }
    loadResources();
  }, [user, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setAnswer('');
    try {
      const selectedResource = resources.find(r => r.id === values.resourceId);
      if (!selectedResource) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not find the selected resource.',
        });
        return;
      }
      const result = await answerQuestion({
        question: values.question,
        resourceTitle: selectedResource.title,
        resourceContent: selectedResource.content,
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
                  Have a question about a specific topic? Select a resource and ask away. Our AI expert will find the answer for you.
                </p>
              </div>

              <Card className="w-full shadow-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                        <CardTitle>Submit Your Question</CardTitle>
                        <CardDescription>Select a resource and type your question below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="resourceId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resource</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={loadingResources}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder={loadingResources ? "Loading resources..." : "Select a resource to ask about"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {resources.map((resource) => (
                                                <SelectItem key={resource.id} value={resource.id}>
                                                    {resource.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
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
