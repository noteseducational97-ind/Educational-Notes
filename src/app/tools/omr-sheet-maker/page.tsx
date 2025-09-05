
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  subtitle: z.string().max(100).optional(),
  questionCount: z.coerce.number().min(1, 'At least one question is required').max(200, 'Maximum 200 questions'),
  pageSize: z.enum(['A4', 'Letter']),
  answerSheetType: z.enum(['multiple-choice', 'numeric-grid']),
  optionsPerQuestion: z.coerce.number().min(2, 'At least 2 options required').max(10, 'Maximum 10 options').optional(),
  optionStyle: z.enum(['alphabetic', 'numeric']).optional(),
}).refine(data => {
    if (data.answerSheetType === 'multiple-choice') {
        return !!data.optionsPerQuestion && !!data.optionStyle;
    }
    return true;
}, {
    message: 'Number of options and style are required for multiple choice.',
    path: ['optionsPerQuestion'],
});


export default function OmrSheetMakerPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      questionCount: 100,
      pageSize: 'A4',
      answerSheetType: 'multiple-choice',
      optionsPerQuestion: 4,
      optionStyle: 'alphabetic',
    },
  });

  const answerSheetType = form.watch('answerSheetType');

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(values);
    // In a real application, this would trigger the PDF generation
    toast({
      title: 'Generating OMR Sheet',
      description: 'Your custom OMR sheet is being created... (This is a demo)',
    });
    // Simulate generation time
    setTimeout(() => {
      setLoading(false);
       toast({
        title: 'Generation Complete!',
        description: 'Your OMR sheet would be downloaded now.',
      });
    }, 2000);
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">OMR Sheet Maker</CardTitle>
                  <CardDescription>
                    Create a custom OMR answer sheet for your practice tests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Test Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Physics Mock Test 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Subtitle (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Based on Class 12 Syllabus" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="questionCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="pageSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select paper size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="answerSheetType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Answer Sheet Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="multiple-choice" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Multiple Choice
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="numeric-grid" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Numeric Grid-in (for integer answers, 0-9)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {answerSheetType === 'multiple-choice' && (
                    <div className='space-y-6 rounded-md border p-4'>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                             <FormField
                                control={form.control}
                                name="optionsPerQuestion"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Number of Options</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={2} max={10} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={form.control}
                                name="optionStyle"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                    <FormLabel>Option Style</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-row space-x-4"
                                        >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="alphabetic" />
                                            </FormControl>
                                            <FormLabel className="font-normal">A, B, C...</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="numeric" />
                                            </FormControl>
                                            <FormLabel className="font-normal">1, 2, 3...</FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" asChild>
                        <Link href="/tools">
                            <ArrowLeft /> Back to Tools
                        </Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        Generate Sheet
                    </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
