'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { getAdmissionFormById, updateAdmissionForm } from '@/lib/firebase/admissions';
import type { AdmissionForm } from '@/types';
import type { Teacher } from '../../../teachers/page';
import { initialTeachers } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, CreditCard, Phone, Wallet } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());

const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const paymentAppOptions = ['PhonePe', 'Google Pay', 'Paytm', 'Bhim Upi', 'Payz'];


const FormSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  className: z.string().min(1, 'Class name is required.'),
  subject: z.enum(['Physics', 'Chemistry']),
  startMonth: z.string().min(1, 'Start month is required.'),
  yearFrom: z.string().min(4, 'From year is required.'),
  yearTo: z.string().min(4, 'To year is required.'),
  description: z.string().min(10, 'Description is required.'),
  isDemoEnabled: z.boolean().default(false),
  demoTenureDays: z.coerce.number().optional(),
  totalFees: z.coerce.number().min(0, 'Total fees must be a positive number.'),
  advanceFees: z.coerce.number().min(0, 'Advance fees must be a positive number.'),
  contactNo: z.string().optional(),
  paymentApp: z.string().optional(),
  upiId: z.string().min(3, 'UPI ID is required.'),
  upiNumber: z.string().min(10, 'UPI number must be at least 10 digits.'),
}).refine(data => parseInt(data.yearTo) > parseInt(data.yearFrom), {
    message: "'To' year must be after 'From' year.",
    path: ['yearTo'],
}).refine(data => {
    if (data.isDemoEnabled) {
        return data.demoTenureDays !== undefined && data.demoTenureDays > 0;
    }
    return true;
}, {
    message: "Demo tenure (in days) is required if demo is enabled.",
    path: ['demoTenureDays'],
});

type FormValues = z.infer<typeof FormSchema>;

export default function EditAdmissionFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const formId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedTeachers = sessionStorage.getItem('managed-teachers');
        if (storedTeachers) {
            setTeachers(JSON.parse(storedTeachers));
        } else {
            setTeachers(initialTeachers);
            sessionStorage.setItem('managed-teachers', JSON.stringify(initialTeachers));
        }
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        title: '',
        className: '',
        yearFrom: currentYear.toString(),
        yearTo: (currentYear + 2).toString(),
        description: '',
        isDemoEnabled: false,
        contactNo: '',
        paymentApp: '',
        upiId: '',
        upiNumber: '',
    }
  });

  const yearFrom = form.watch('yearFrom');
  const className = form.watch('className');
  const subject = form.watch('subject');
  const isDemoEnabled = form.watch('isDemoEnabled');
  
  const generateDescription = (className: string, yearFrom: string, subject?: 'Physics' | 'Chemistry') => {
    if (!subject) return '';
    let teacher = "our expert teacher";
    if (subject === 'Physics') {
        teacher = "Pravin Sir";
    } else if (subject === 'Chemistry') {
        teacher = "Mangesh Sir";
    }
    return `Admission for ${className} (${yearFrom}) with ${teacher}. Join us to excel in your studies.`;
  };

  useEffect(() => {
    if (yearFrom) {
        const toYearValue = (parseInt(yearFrom, 10) + 2).toString();
        form.setValue('yearTo', toYearValue, { shouldValidate: true });
    }
  }, [yearFrom, form]);

  useEffect(() => {
    if(className && yearFrom && subject) {
        const newDescription = generateDescription(className, yearFrom, subject);
        form.setValue('description', newDescription);
    }
  }, [className, yearFrom, subject, form])

  useEffect(() => {
    if (subject && teachers.length > 0) {
        const matchingTeacher = teachers.find(t => t.subject.toLowerCase().includes(subject.toLowerCase()));
        if (matchingTeacher) {
            if (matchingTeacher.className) {
                form.setValue('className', matchingTeacher.className, { shouldValidate: true });
            }
             if (matchingTeacher.mobile) {
                form.setValue('contactNo', matchingTeacher.mobile, { shouldValidate: true });
            }
        }
    }
  }, [subject, teachers, form]);
  
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    getAdmissionFormById(formId)
      .then(data => {
        if (data) {
          setFormDetails(data);
          const [yearFromValue, yearToSuffix] = data.year.split('-');
          const yearToValue = yearFromValue.substring(0, 2) + yearToSuffix;
          form.reset({
            ...data,
            yearFrom: yearFromValue,
            yearTo: yearToValue,
          });
        } else {
          toast({ variant: 'destructive', title: 'Form not found' });
          router.push('/admin/admission');
        }
      })
      .finally(() => setLoading(false));
  }, [formId, form, router, toast]);

  async function onSubmit(values: FormValues) {
    if (!formId) return;
    setIsSubmitting(true);
    try {
      const year = `${values.yearFrom}-${values.yearTo.slice(-2)}`;
      const { yearFrom, yearTo, ...rest } = values;

      await updateAdmissionForm(formId, { ...rest, year });
      toast({
        title: 'Success!',
        description: `Admission form "${values.title}" has been updated.`,
      });
      router.push('/admin/admission');
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Admission Form</CardTitle>
                    <CardDescription>Update details for: {formDetails?.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch Title</FormLabel>
                                <FormControl><Input placeholder="Class 11 Physics" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="subject" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Physics">Physics</SelectItem>
                                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="className" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Class 11 / MHT-CET" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="startMonth" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Month</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {monthOptions.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="yearFrom" render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Year</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="From" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {yearOptions.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="yearTo" render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Year</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="To" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      {yearOptions.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                     </div>
                     <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Admission for Class 11 Physics..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <div className="border-t pt-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="isDemoEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Enable Demo Session
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {isDemoEnabled && (
                            <FormField
                                control={form.control}
                                name="demoTenureDays"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Demo Session Tenure (in days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                    </div>
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><CreditCard /> Payment Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="totalFees" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Fees</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g. 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="advanceFees" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Advance Fees</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g. 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="contactNo" render={({ field }) => (
                               <FormItem>
                                   <FormLabel className="flex items-center gap-2"><Phone /> Contact No.</FormLabel>
                                   <FormControl><Input placeholder="Contact number for payment queries" {...field} value={field.value ?? ''} /></FormControl>
                                   <FormMessage />
                               </FormItem>
                           )} />
                            <FormField control={form.control} name="paymentApp" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Wallet /> Supported Payment App</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a payment app" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {paymentAppOptions.map(app => <SelectItem key={app} value={app}>{app}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="upiId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID</FormLabel>
                                    <FormControl><Input placeholder="e.g. username@upi" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="upiNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI Number</FormLabel>
                                    <FormControl><Input placeholder="e.g. 9876543210" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 border-t pt-6">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/admission"><ArrowLeft /> Back</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
  );
}
