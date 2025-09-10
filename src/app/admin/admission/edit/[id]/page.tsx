
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { getAdmissionFormById, updateAdmissionForm } from '@/lib/firebase/admissions';
import type { AdmissionForm, Teacher } from '@/types';
import { getTeachers } from '@/lib/firebase/teachers';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, CreditCard, Phone, Wallet, User, Book, Sparkles, KeyRound, Shield, Image as ImageIcon, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import PasswordPrompt from '@/components/auth/PasswordPrompt';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());

const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const paymentAppOptions = ['PhonePe', 'Google Pay', 'Bhim Upi'];
const studyOptions = ['Science(HSC)', 'MHT-CET'];


const upiHandles: { [key: string]: string } = {
    'PhonePe': '@ybl',
    'Google Pay': '@okaxis',
    'Bhim Upi': '@upi',
};


const FormSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  teacherName: z.string().min(1, 'Please select a teacher.'),
  study: z.string().min(1, 'Study is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  className: z.string().min(1, 'Class name is required.'),
  startMonth: z.string().min(1, 'Start month is required.'),
  yearFrom: z.string().min(4, 'From year is required.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional(),
  totalFees: z.coerce.number().min(0, 'Total fees must be a positive number.'),
  advanceFees: z.coerce.number().min(0, 'Advance fees must be a positive number.'),
  contactNo: z.string().optional(),
  paymentApp: z.string().optional(),
  upiId: z.string().min(3, 'UPI ID is required.'),
  upiNumber: z.string().min(10, 'UPI number must be at least 10 digits.'),
  isPasswordProtected: z.boolean().default(false),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
    if (data.isPasswordProtected) {
        return data.password && data.password.length >= 6;
    }
    return true;
}, {
    message: "Password must be at least 6 characters long.",
    path: ['password'],
}).refine(data => {
    if (data.isPasswordProtected) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match.",
    path: ['confirmPassword'],
});


type FormValues = z.infer<typeof FormSchema>;

const generateDescription = (className: string, teacherName: string, subject: string, year: string) => {
    return `Enroll in the ${className} for ${subject} with ${teacherName} for the academic year ${year}. This batch offers comprehensive coverage of the syllabus, personalized attention, and proven strategies to excel in your exams. Secure your spot now and embark on a rewarding learning journey!`;
}

export default function EditAdmissionFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const formId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    getTeachers().then(setTeachers);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        title: '',
        teacherName: '',
        study: '',
        className: '',
        yearFrom: currentYear.toString(),
        imageUrl: '',
        contactNo: '',
        paymentApp: '',
        upiId: '',
        upiNumber: '',
        isPasswordProtected: false,
        password: '',
        confirmPassword: '',
    }
  });

  const yearFrom = form.watch('yearFrom');
  const teacherName = form.watch('teacherName');
  const contactNo = form.watch('contactNo');
  const paymentApp = form.watch('paymentApp');
  const isPasswordProtected = form.watch('isPasswordProtected');
  
  useEffect(() => {
    if (teacherName && teachers.length > 0) {
        const selectedTeacher = teachers.find(t => t.name === teacherName);
        if (selectedTeacher) {
            form.setValue('subject', selectedTeacher.subject as 'Physics' | 'Chemistry', { shouldValidate: true });
            form.setValue('className', selectedTeacher.className, { shouldValidate: true });
            form.setValue('contactNo', selectedTeacher.mobile || '', { shouldValidate: true });
        }
    }
  }, [teacherName, teachers, form]);
  
  useEffect(() => {
    if (contactNo) {
        form.setValue('upiNumber', contactNo, { shouldValidate: true });
    }
  }, [contactNo, form]);
  
  useEffect(() => {
    if (contactNo && paymentApp) {
        const handle = upiHandles[paymentApp] || '';
        form.setValue('upiId', `${contactNo}${handle}`, { shouldValidate: true });
    }
  }, [contactNo, paymentApp, form]);
  
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    getAdmissionFormById(formId)
      .then(data => {
        if (data) {
          setFormDetails(data);
           if (!data.isPasswordProtected) {
              setIsAuthenticated(true);
           } else {
               const storedPassword = sessionStorage.getItem(`admission-password-${formId}`);
               if (storedPassword === data.password) {
                   setIsAuthenticated(true);
               }
           }
        } else {
          toast({ variant: 'destructive', title: 'Form not found' });
          router.push('/admin/admission');
        }
      })
      .finally(() => setLoading(false));
  }, [formId, router, toast]);
  
  useEffect(() => {
      if(isAuthenticated && formDetails) {
          const [yearFromValue] = formDetails.year.split('-');
          form.reset({
            ...formDetails,
            password: formDetails.password || '',
            confirmPassword: formDetails.password || '',
            yearFrom: yearFromValue,
          });
      }
  }, [isAuthenticated, formDetails, form]);

  async function onSubmit(values: FormValues) {
    if (!formId) return;
    setIsSubmitting(true);
    try {
      const yearTo = (parseInt(values.yearFrom, 10) + 2).toString();
      const year = `${values.yearFrom}-${yearTo.slice(-2)}`;
      const description = generateDescription(values.className, values.teacherName, values.subject, year);
      const { yearFrom, confirmPassword, ...rest } = values;

      await updateAdmissionForm(formId, { ...rest, year, description });
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
  
  if (!isAuthenticated && formDetails && formId) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center">
            <PasswordPrompt 
                formId={formId} 
                correctPassword={formDetails.password} 
                onSuccess={() => setIsAuthenticated(true)}
            />
          </div>
      );
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Admission Form</CardTitle>
                    <CardDescription>Update details for: {formDetails?.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><ImageIcon/> Image URL</FormLabel>
                            <FormControl><Input placeholder="https://example.com/image.png or a Google Drive link" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch Title</FormLabel>
                                <FormControl><Input placeholder="Class 11 Physics" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="study" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><BookOpen/> Study / Exam</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a study type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {studyOptions.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="className" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Class 11 / MHT-CET" {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="subject" render={({ field }) => (
                             <FormItem>
                                <FormLabel className="flex items-center gap-2"><Book /> Subject</FormLabel>
                                <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="teacherName" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><User /> Teacher</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {teachers.map(teacher => (
                                            <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
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
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Security</CardTitle>
                    <CardDescription>Protect this admission form with a password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="isPasswordProtected"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Enable Batch Password</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    {isPasswordProtected && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><KeyRound/> Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Enter password" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><KeyRound/> Confirm Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Confirm password" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                </CardContent>
            </Card>

             <div className="flex justify-between gap-4 pt-6">
                <Button type="button" variant="outline" asChild>
                    <Link href="/admin/admission"><ArrowLeft /> Back</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                    Save Changes
                </Button>
            </div>
        </form>
    </Form>
  );
}

    

    

    

    