
'use client';

import { useState } from 'react';
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
import { Loader2, ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  class: z.string().min(1, 'Please select a class.'),
  stream: z.array(z.string()).optional(),
  category: z.array(z.string()).nonempty({ message: 'Select at least one category.' }),
  subject: z.array(z.string()).optional(),
  url: z.string().url('Please enter a valid URL.'),
});

const streamsByClass: { [key: string]: string[] } = {
  '11': ['Science', 'Commerce', 'Arts'],
  '12': ['Science', 'Commerce', 'Arts'],
};

const subjectsByStream: { [key: string]: string[] } = {
    'Science': ['Physics', 'Chemistry', 'Maths', 'Biology'],
    'Commerce': ['Accountancy', 'Business Studies', 'Economics'],
    'Arts': ['History', 'Geography', 'Political Science', 'Sociology']
}

const categories = ['Notes', 'Previous Year Questions', 'Syllabus'];

export default function AddResourcePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      class: '',
      stream: [],
      category: [],
      subject: [],
      url: '',
    },
  });

  const selectedClass = form.watch('class');
  const selectedStreams = form.watch('stream') || [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await addResource({
        ...values,
        stream: values.stream || [],
        subject: values.subject || [],
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
                              <SelectItem value="9">Class 9</SelectItem>
                              <SelectItem value="10">Class 10</SelectItem>
                              <SelectItem value="11">Class 11</SelectItem>
                              <SelectItem value="12">Class 12</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedClass && streamsByClass[selectedClass] && (
                      <FormField
                        control={form.control}
                        name="stream"
                        render={() => (
                          <FormItem>
                            <FormLabel>Stream</FormLabel>
                            <div className="flex flex-wrap gap-4">
                              {streamsByClass[selectedClass].map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="stream"
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

                {selectedStreams.length > 0 && (
                    <FormField
                        control={form.control}
                        name="subject"
                        render={() => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <div className="flex flex-wrap gap-4">
                            {selectedStreams.flatMap(stream => subjectsByStream[stream] || []).filter(Boolean).map((item) => (
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
                )}

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link for Download</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/resource-download-link" {...field} />
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
