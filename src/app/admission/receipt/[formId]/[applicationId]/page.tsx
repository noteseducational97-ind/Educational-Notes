
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdmissionFormById, getApplicationById } from '@/lib/firebase/admissions';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const ReceiptDetail = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

export default function AdmissionReceiptPage() {
    const params = useParams();
    const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
    const [application, setApplication] = useState<AdmissionApplication | null>(null);
    const [loading, setLoading] = useState(true);

    const formId = params.formId as string;
    const applicationId = params.applicationId as string;

    useEffect(() => {
        if (!formId || !applicationId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [form, app] = await Promise.all([
                    getAdmissionFormById(formId),
                    getApplicationById(formId, applicationId),
                ]);
                setFormDetails(form);
                setApplication(app);
            } catch (error) {
                console.error("Failed to fetch receipt data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formId, applicationId]);

    const handlePrint = () => {
        window.print();
    };
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!formDetails || !application) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <p>Could not load receipt details.</p>
                <Button asChild variant="link">
                    <Link href="/admission">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Link>
                </Button>
            </div>
        );
    }
    
    let coachingName = '';
    if (formDetails.subject === 'Physics') {
        coachingName = 'Shree Coaching Classes';
    } else if (formDetails.subject === 'Chemistry') {
        coachingName = 'ChemStar Chemistry Classes';
    } else if (formDetails.title.toLowerCase().includes('mht-cet')) {
        coachingName = 'Shree Coaching & ChemStar Classes';
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                     <div className="flex justify-between items-center mb-8 print:hidden">
                        <Button asChild variant="outline">
                            <Link href="/admission">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admissions
                            </Link>
                        </Button>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                        </Button>
                    </div>

                    <Card className="print:shadow-none print:border-none">
                        <CardHeader className="text-center">
                            {coachingName && (
                                <h1 className="text-3xl font-bold tracking-tight text-primary">{coachingName}</h1>
                            )}
                            <h2 className="text-2xl font-semibold">Admission Receipt</h2>
                            <p className="text-muted-foreground">For {formDetails.title} ({formDetails.year})</p>
                            <p className="text-sm text-muted-foreground pt-2">
                                Submitted on: {format(new Date(application.submittedAt), 'PPP')}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <section>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <ReceiptDetail label="Full Name" value={application.fullName} />
                                    <ReceiptDetail label="Date of Birth" value={format(new Date(application.dateOfBirth), 'PPP')} />
                                    <ReceiptDetail label="Gender" value={application.gender} />
                                    <ReceiptDetail label="Student Phone" value={application.studentPhone} />
                                    <ReceiptDetail label="Address" value={application.address} />
                                    <ReceiptDetail label="Category" value={application.category} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Parent Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <ReceiptDetail label="Father's Name" value={application.fatherName} />
                                     <ReceiptDetail label="Father's Occupation" value={application.fatherOccupation} />
                                    <ReceiptDetail label="Mother's Name" value={application.motherName} />
                                    <ReceiptDetail label="Parent Phone" value={application.parentPhone} />
                                </div>
                            </section>

                             <section>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Academic Information</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <ReceiptDetail label="Previous School" value={application.previousSchool} />
                                    <ReceiptDetail label="Board" value={application.board} />
                                    <ReceiptDetail label="Percentage" value={application.percentage} />
                                </div>
                            </section>

                             <section>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Payment Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <ReceiptDetail label="Total Fees" value={`₹${formDetails.totalFees.toLocaleString()}`} />
                                    <ReceiptDetail label="Advance Fees Paid" value={`₹${formDetails.advanceFees.toLocaleString()}`} />
                                    <ReceiptDetail label="Payment Mode" value={application.paymentMode} />
                                </div>
                                 {application.paymentMode === 'Online' && (
                                     <div className="mt-4 border-t pt-4">
                                         <h4 className="font-medium">Online Payment Info:</h4>
                                         <div className="grid grid-cols-2 gap-4 mt-2">
                                             <ReceiptDetail label="Sender Name" value={application.senderName} />
                                             <ReceiptDetail label="Amount" value={application.paymentAmount} />
                                             <ReceiptDetail label="Date" value={application.transactionDate} />
                                             <ReceiptDetail label="Time" value={application.transactionTime} />
                                         </div>
                                     </div>
                                 )}
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
