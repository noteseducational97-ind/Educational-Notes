
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { addResource } from '@/lib/firebase/resources';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  class: z.string().min(1, 'Please select a class.'),
  stream: z.enum(['All', 'Science', 'Commerce', 'Arts']),
  category: z.enum(['All', 'Notes', 'PYQ', 'Syllabus']),
  subject: z.enum(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science']),
  imageUrl: z.any().refine(file => file?.[0], { message: 'Image is required.' }),
  pdfUrl: z.string().url('Please enter a valid PDF URL.').optional().or(z.literal('')),
});

const categories = ['All', 'Notes', 'PYQ', 'Syllabus'];
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science'];
const classes = ['class9', 'class10', 'class11', 'class12'];
const streams = ['All', 'Science', 'Commerce', 'Arts'];

export default function AddResourcePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      pdfUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Note: In a real app, you would upload the image file to a storage service (like Firebase Storage)
      // and get back a URL to save in the database. For this prototype, we are passing a placeholder.
      const placeholderImageUrl = 'https://placehold.co/600x400.png';
      
      const resourceData = {
        ...values,
        imageUrl: placeholderImageUrl,
      };

      await addResource(resourceData);
      toast({
        title: 'Success',
        description: 'Resource has been uploaded successfully.',
      });
      router.push('/downloads');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error uploading resource',
        description: 'Could not add resource.',
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="w-full max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">Add New Resource</CardTitle>
                  <CardDescription>Fill in the details below to add a new study material to the library.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name / Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Complete Notes for Physics Class 12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A brief summary of the resource." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Content / Details</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed explanation or content of the resource." rows={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                            <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="class" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                            <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>Class {c.replace('class', '')}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="stream" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream / Exam</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a stream" /></SelectTrigger></FormControl>
                            <SelectContent>{streams.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pdfUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PDF URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/preview.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t pt-6">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/downloads"><ArrowLeft /> Back</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Upload />}
                        Upload
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
