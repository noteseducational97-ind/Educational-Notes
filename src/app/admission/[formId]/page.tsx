
'use client';

import { useParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Home, GraduationCap, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  // Personal Info
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  gender: z.string().min(1, 'Please select a gender.'),
  studentPhone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(3, 'Please enter a valid name.'),
  category: z.string().min(1, 'Please select a category.'),

  // Parent Info
  fatherName: z.string().min(3, "Father's name is required."),
  motherName: z.string().min(3, "Mother's name is required."),
  fatherOccupation: z.string().min(2, "Occupation is required."),
  parentPhone: z.string().min(10, 'Please enter a valid phone number.'),

  // Previous Year Data
  previousSchool: z.string().min(3, 'Previous school name is required.'),
  board: z.string().min(1, 'Board is required.'),
  percentage: z.string().min(1, 'Percentage is required.'),
  
  // Payment
  paymentMode: z.string().min(1, 'Please select a payment mode.'),
});

type FormValues = z.infer<typeof formSchema>;

const formIdToTitle: { [key: string]: string } = {
    'class-11-physics': 'Class 11 Physics',
    'class-12-physics': 'Class 12 Physics',
    'class-11-chemistry': 'Class 11 Chemistry',
    'class-12-chemistry': 'Class 12 Chemistry',
    'mht-cet': 'MHT-CET',
};


export default function AdmissionFormPage() {
    const params = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
    const formTitle = formIdToTitle[formId] || 'Admission Form';

    let coachingName = '';
    if (formId.includes('physics')) {
        coachingName = 'Shree Coaching Classes';
    } else if (formId.includes('chemistry')) {
        coachingName = 'ChemStar Chemistry Classes';
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            dateOfBirth: '',
            studentPhone: '',
            address: '',
            fatherName: '',
            motherName: '',
            fatherOccupation: '',
            parentPhone: '',
            previousSchool: '',
            board: '',
            percentage: '',
            paymentMode: 'Online',
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        console.log(values);
        // Here you would typically send the data to your backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        toast({
            title: 'Application Submitted!',
            description: 'We have received your application and will contact you shortly.',
        });
        form.reset();
    }
    
    const paymentMode = form.watch('paymentMode');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Button asChild variant="outline" className="mb-8">
                        <Link href="/admission">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Admissions
                        </Link>
                    </Button>
                    <div className="text-center mb-8">
                        {coachingName && (
                             <h1 className="text-4xl font-bold tracking-tight text-primary">{coachingName}</h1>
                        )}
                        <p className="mt-2 text-lg text-muted-foreground">
                            Please fill out the form below to apply for {formTitle}.
                        </p>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><User /> Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="fullName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <div className="grid md:grid-cols-2 gap-4">
                                        <FormField name="dateOfBirth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Gender</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your gender" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField name="studentPhone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Student Phone</FormLabel>
                                                <FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField name="address" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name Of Village or City</FormLabel>
                                                <FormControl><Input placeholder="Enter the name of your village or city" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                     <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your category" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="OBC">OBC</SelectItem>
                                                    <SelectItem value="SC">SC</SelectItem>
                                                    <SelectItem value="ST">ST</SelectItem>
                                                    <SelectItem value="VJ">VJ</SelectItem>
                                                    <SelectItem value="NT">NT</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Home/> Parent Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid md:grid-cols-2 gap-4">
                                        <FormField name="fatherName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Father's Full Name</FormLabel>
                                                <FormControl><Input placeholder="Enter father's name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField name="fatherOccupation" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Father's Occupation</FormLabel>
                                                <FormControl><Input placeholder="Enter father's occupation" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField name="motherName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mother's Full Name</FormLabel>
                                                <FormControl><Input placeholder="Enter mother's name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField name="parentPhone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent/Guardian Phone Number</FormLabel>
                                                <FormControl><Input placeholder="Enter parent's phone number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><GraduationCap /> Previous Academic Data</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid md:grid-cols-3 gap-4">
                                        <FormField name="previousSchool" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Previous School Name</FormLabel>
                                                <FormControl><Input placeholder="Enter school name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField
                                            control={form.control}
                                            name="board"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Board</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select board" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    <SelectItem value="State Board">State Board</SelectItem>
                                                    <SelectItem value="CBSE">CBSE</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField name="percentage" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Class 10 Percentage</FormLabel>
                                                <FormControl><Input placeholder="e.g., 90%" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><CreditCard /> Payment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4 text-center">
                                        <div className="bg-secondary/30 p-4 rounded-lg">
                                            <p className="text-muted-foreground text-sm">Total Fees</p>
                                            <p className="text-2xl font-bold">₹15,000</p>
                                        </div>
                                        <div className="bg-secondary/30 p-4 rounded-lg">
                                            <p className="text-muted-foreground text-sm">Advance Fees</p>
                                            <p className="text-2xl font-bold">₹5,000</p>
                                        </div>
                                    </div>
                                    <div className="max-w-xs">
                                        <FormField
                                            control={form.control}
                                            name="paymentMode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Payment Mode</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a payment mode" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                        <SelectItem value="Online">Online</SelectItem>
                                                        <SelectItem value="Offline">Offline</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    {paymentMode === 'Online' && (
                                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-4">
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                             <div className="flex justify-end">
                                <Button type="submit" disabled={loading} size="lg">
                                    {loading ? <Loader2 className="animate-spin" /> : <>Submit Application <ArrowRight className="ml-2"/></>}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </main>
        </div>
    );
}
