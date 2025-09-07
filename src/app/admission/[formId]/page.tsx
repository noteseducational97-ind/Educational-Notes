
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
import { Loader2, User, Mail, Phone, Home, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  // Personal Info
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  email: z.string().email('Please enter a valid email.'),
  studentPhone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(10, 'Please enter a valid address.'),

  // Parent Info
  fatherName: z.string().min(3, "Father's name is required."),
  fatherOccupation: z.string().min(2, "Occupation is required."),
  parentPhone: z.string().min(10, 'Please enter a valid phone number.'),

  // Previous Year Data
  previousSchool: z.string().min(3, 'School name is required.'),
  board: z.string().min(2, 'Board is required (e.g., CBSE, State Board).'),
  percentage: z.string().min(1, 'Percentage is required.'),
  achievements: z.string().optional(),
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
            email: '',
            studentPhone: '',
            address: '',
            fatherName: '',
            fatherOccupation: '',
            parentPhone: '',
            previousSchool: '',
            board: '',
            percentage: '',
            achievements: '',
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
                                        <FormField name="studentPhone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Student Phone</FormLabel>
                                                <FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input placeholder="Enter your email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Residential Address</FormLabel>
                                            <FormControl><Textarea placeholder="Enter your full address" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
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
                                    </div>
                                     <FormField name="parentPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent/Guardian Phone Number</FormLabel>
                                            <FormControl><Input placeholder="Enter parent's phone number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
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
                                                <FormLabel>School/College Name (Last Attended)</FormLabel>
                                                <FormControl><Input placeholder="Enter school name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField name="board" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Board</FormLabel>
                                                <FormControl><Input placeholder="e.g., CBSE" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField name="percentage" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Percentage/Grade (Previous Class)</FormLabel>
                                                <FormControl><Input placeholder="e.g., 90%" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField name="achievements" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Achievements (Optional)</FormLabel>
                                            <FormControl><Textarea placeholder="Any notable academic or extracurricular achievements" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
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
