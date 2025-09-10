
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { addAdmissionForm } from '@/lib/firebase/admissions';
import type { Teacher } from '@/types';
import { getTeachers } from '@/lib/firebase/teachers';
import { generateAdmissionDescription } from '@/ai/flows/admission-description-flow';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, CreditCard, Phone, Wallet, User, Book, Sparkles, KeyRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());

const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const paymentAppOptions = ['PhonePe', 'Google Pay', 'Bhim Upi', 'Payz'];

const upiHandles: { [key: string]: string } = {
    'PhonePe': '@ybl',
    'Google Pay': '@okaxis',
    'Bhim Upi': '@upi',
    'Payz': '@pz'
};


const FormSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  teacherName: z.string().min(1, 'Please select a teacher.'),
  subject: z.enum(['Physics', 'Chemistry']),
  className: z.string().min(1, 'Class name is required.'),
  startMonth: z.string().min(1, 'Start month is required.'),
  yearFrom: z.string().min(4, 'From year is required.'),
  yearTo: z.string().min(4, 'To year is required.'),
  description: z.string().min(100, 'Description must be at least 100 characters.'),
  isDemoEnabled: z.boolean().default(false),
  demoTenureDays: z.coerce.number().optional(),
  totalFees: z.coerce.number().min(0, 'Total fees must be a positive number.'),
  advanceFees: z.coerce.number().min(0, 'Advance fees must be a positive number.'),
  contactNo: z.string().optional(),
  paymentApp: z.string().optional(),
  upiId: z.string().min(3, 'UPI ID is required.'),
  upiNumber: z.string().min(10, 'UPI number must be at least 10 digits.'),
  isPasswordProtected: z.boolean().default(false),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
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

export default function AddAdmissionFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    getTeachers().then(setTeachers);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        title: '',
        teacherName: '',
        className: '',
        yearFrom: currentYear.toString(),
        yearTo: (currentYear + 2).toString(),
        description: '',
        isDemoEnabled: false,
        demoTenureDays: undefined,
        totalFees: undefined,
        advanceFees: undefined,
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
  const isDemoEnabled = form.watch('isDemoEnabled');
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
    if (yearFrom) {
      const toYearValue = (parseInt(yearFrom, 10) + 2).toString();
      form.setValue('yearTo', toYearValue);
    }
  }, [yearFrom, form]);


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

  const handleGenerateDescription = async () => {
    const { title, teacherName, subject, className, yearFrom, yearTo } = form.getValues();
    if (!title || !teacherName || !subject || !className || !yearFrom || !yearTo) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out the title, teacher, and year fields before generating a description.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAdmissionDescription({
        title,
        teacherName,
        subject,
        className,
        year: `${yearFrom}-${yearTo.slice(-2)}`,
      });
      if (result.description) {
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
          title: 'Description Generated!',
          description: 'The admission form description has been filled in for you.',
        });
      } else {
        throw new Error('Received empty description from AI.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the description. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const year = `${values.yearFrom}-${values.yearTo.slice(-2)}`;
      const { yearFrom, yearTo, confirmPassword, ...rest } = values;

      await addAdmissionForm({ ...rest, year });

      toast({
        title: 'Success!',
        description: `Admission form "${values.title}" has been created.`,
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

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Admission Form</CardTitle>
                    <CardDescription>Fill out the details to create a new admission process.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch Title</FormLabel>
                                <FormControl><Input placeholder="e.g. MHT-CET Crash Course" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
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
                        <FormField control={form.control} name="subject" render={({ field }) => (
                             <FormItem>
                                <FormLabel className="flex items-center gap-2"><Book /> Subject</FormLabel>
                                <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="className" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Class 11 / MHT-CET" {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="startMonth" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Month</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormControl><Textarea placeholder="A brief description of the admission batch" {...field} rows={5} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Generate with AI
                    </Button>

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
                        Create Form
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
  );
}
