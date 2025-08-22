
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
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  stream: z.string().min(1, 'Please select a stream.'),
  class: z.string().optional(),
  category: z.array(z.string()).nonempty({ message: 'Select at least one category.' }),
  subject: z.array(z.string()).nonempty({ message: 'Select at least one subject.' }),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  pdfUrl: z.string().url('PDF URL is required.'),
}).refine(data => {
  if (data.stream === 'Science' || data.stream === 'Commerce') {
    return !!data.class;
  }
  return true;
}, {
  message: "Class is required for this stream.",
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

export default function AddResourcePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      stream: '',
      class: '',
      category: [],
      subject: [],
      imageUrl: '',
      pdfUrl: '',
    },
  });

  const selectedStream = form.watch('stream');
  
  useEffect(() => {
    if (selectedStream === 'MHT-CET' || selectedStream === 'NEET') {
      form.setValue('class', undefined);
    }
  }, [selectedStream, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await addResource({
        ...values,
      });
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

  const getClassOptions = () => {
    if (selectedStream === 'Science') return scienceClasses;
    if (selectedStream === 'Commerce') return commerceClasses;
    return [];
  }

  const showClassField = selectedStream === 'Science' || selectedStream === 'Commerce';

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                      control={form.control}
                      name="stream"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a stream" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allStreams.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    render={() => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                         <div className="flex flex-wrap gap-4">
                            {categories.map((item) => (
                                <FormField
                                key={item}
                                control={form.control}
                                name="category"
                                render={({ field }) => {
                                    return (
                                    <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                      control={form.control}
                      name="subject"
                      render={() => (
                      <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <div className="flex flex-wrap gap-4">
                          {allSubjects.map((item) => (
                              <FormField
                              key={item}
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                  <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                      <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                          return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(field.value?.filter((value) => value !== item));
                                      }}
                                      />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item}</FormLabel>
                                  </FormItem>
                              )}
                              />
                          ))}
                          </div>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...field} />
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
                        <FormLabel>PDF URL</FormLabel>
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
