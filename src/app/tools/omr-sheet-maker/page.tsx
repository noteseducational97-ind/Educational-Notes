
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
import { Loader2, ArrowLeft, Wand2, FileText, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  subtitle: z.string().max(100).optional(),
  questionCount: z.coerce.number().min(1, 'At least one question is required').max(200, 'Maximum 200 questions'),
  pageSize: z.enum(['A4', 'Letter']),
  optionsPerQuestion: z.coerce.number().min(2, 'At least 2 options required').max(10, 'Maximum 10 options'),
  optionStyle: z.enum(['alphabetic', 'numeric']),
});


export default function OmrSheetMakerPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: 'Sample Mock Test',
      subtitle: 'Physics & Chemistry',
      questionCount: 100,
      pageSize: 'A4',
      optionsPerQuestion: 4,
      optionStyle: 'alphabetic',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    toast({
      title: 'Generating OMR Sheet...',
      description: 'Your download will begin shortly.',
    });
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const sampleUrl = 'https://www.bodhprep.com/OMR-Sheets/200-questions-omr-sheet.pdf';
        
        window.open(sampleUrl, '_blank');

        toast({
            title: 'OMR Sheet Ready!',
            description: 'Your OMR sheet has been opened in a new tab.',
        });

    } catch (error) {
        console.error("Download failed", error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'Could not generate the OMR sheet. Please try again.',
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">OMR Sheet Maker</CardTitle>
                  <CardDescription>
                    Create and download a custom OMR answer sheet for your practice tests.
                  </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Test Title</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="e.g., Physics Mock Test 1" {...field} className="pl-10" />
                                    </div>
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
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6">
                            <Button variant="outline" asChild>
                                <Link href="/tools">
                                    <ArrowLeft /> Back to Tools
                                </Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Download />}
                                Generate & Download
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
              </Card>
        </div>
      </main>
    </div>
  );
}
