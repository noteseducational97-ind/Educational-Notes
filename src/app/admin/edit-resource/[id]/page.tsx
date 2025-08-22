
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { updateResourceAction } from '@/app/admin/actions';
import { getResourceById } from '@/lib/firebase/resources';
import type { Resource } from '@/types';

import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { MultiSelect } from '@/components/ui/multi-select';

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  stream: z.array(z.string()).nonempty({ message: 'Select at least one stream.' }),
  class: z.string().optional(),
  category: z.array(z.string()).nonempty({ message: 'Select at least one category.' }),
  subject: z.array(z.string()).nonempty({ message: 'Select at least one subject.' }),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  pdfUrl: z.string().url('PDF URL is required.'),
}).refine(data => {
  if (data.stream.includes('Science') || data.stream.includes('Commerce')) {
    return !!data.class;
  }
  return true;
}, {
  message: "Class is required for the selected stream(s).",
  path: ["class"],
});

const allStreams = ['Science', 'MHT-CET', 'NEET', 'Commerce'];
const scienceClasses = ['9', '10', '11', '12'];
const commerceClasses = ['11', '12'];
const allSubjects = [
    'Physics', 'Chemistry', 'Maths', 'Biology',
    'Accountancy', 'Business Studies', 'Economics',
    'History', 'Geography', 'Political Science', 'Sociology'
];
const categories = ['Notes', 'Previous Year Questions', 'Syllabus'];

export default function EditResourceAdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);

  const resourceId = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      pdfUrl: '',
      stream: [],
      class: '',
      category: [],
      subject: [],
    },
  });
  
  const selectedStreams = form.watch('stream');
  
  useEffect(() => {
    const requiresClass = selectedStreams.some(s => ['Science', 'Commerce'].includes(s));
    if (!requiresClass) {
      form.setValue('class', undefined);
    }
  }, [selectedStreams, form]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        toast({ variant: 'destructive', title: 'Unauthorized' });
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router, toast]);

  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;
      setLoadingResource(true);
      const fetchedResource = await getResourceById(resourceId);
      if (fetchedResource) {
        setResource(fetchedResource);
        form.reset(fetchedResource);
      } else {
        toast({ variant: 'destructive', title: 'Resource not found' });
        router.push('/admin');
      }
      setLoadingResource(false);
    };
    fetchResource();
  }, [resourceId, form, router, toast]);


  async function onSubmit(values: z.infer<typeof FormSchema>) {
    if (!resourceId) return;
    setIsSubmitting(true);
    try {
      const result = await updateResourceAction(resourceId, values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: `Resource "${values.title}" has been updated.`,
        });
        router.push('/admin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error updating resource',
          description: result.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Unexpected Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !isAdmin || loadingResource) {
    return <LoadingSpinner />;
  }

  const getClassOptions = () => {
    return [...new Set([...scienceClasses, ...commerceClasses])];
  }

  const showClassField = selectedStreams.some(s => ['Science', 'Commerce'].includes(s));


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="w-full max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">Edit Resource</CardTitle>
                  <CardDescription>Update the details for "{resource?.title}".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chapter 1: Electric Charges and Fields" {...field} />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="stream"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream(s)</FormLabel>
                           <MultiSelect
                                options={allStreams.map(s => ({ value: s, label: s }))}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                placeholder="Select streams..."
                            />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {showClassField && (
                        <FormField
                          control={form.control}
                          name="class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {getClassOptions().map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                       <FormItem>
                            <FormLabel>Category</FormLabel>
                            <MultiSelect
                                options={categories.map(c => ({ value: c, label: c }))}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                placeholder="Select categories..."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                  />

                  <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                         <FormItem>
                            <FormLabel>Subject</FormLabel>
                             <MultiSelect
                                options={allSubjects.map(s => ({ value: s, label: s }))}
                                onValue-change={field.onChange}
                                defaultValue={field.value}
                                placeholder="Select subjects..."
                            />
                            <FormMessage />
                        </FormItem>
                      )}
                  />
                  
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="pdfUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>PDF URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/preview.pdf" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between gap-4 border-t pt-6">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin"><ArrowLeft /> Back</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                        Save Changes
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

    