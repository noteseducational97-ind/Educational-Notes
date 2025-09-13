

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { getAdmissionFormById, getApplicationById } from '@/lib/firebase/admissions';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Printer, User, Home, Book, CreditCard, QrCode } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';
import { useAuth } from '@/hooks/use-auth';

const ReceiptDetail = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-medium text-sm">{value}</p>
        </div>
    );
}

export default function AdmissionReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
    const [application, setApplication] = useState<AdmissionApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    const formId = params.formId as string;
    const applicationId = params.applicationId as string;

    useEffect(() => {
        if (authLoading) return;

        const fetchData = async () => {
            if (!formId || !applicationId) return;

            setLoading(true);
            try {
                const [form, app] = await Promise.all([
                    getAdmissionFormById(formId),
                    getApplicationById(formId, applicationId),
                ]);

                if (!form || !app) {
                    throw new Error("Receipt details not found.");
                }

                // Authorization check
                if (isAdmin || (user && user.uid === app.userId)) {
                    setIsAuthorized(true);
                    setFormDetails(form);
                    setApplication(app);

                    const QRCode = (await import('qrcode')).default;
                    const qrData = JSON.stringify({
                        applicationId: app?.id,
                        name: app?.fullName,
                        form: form?.title
                    });
                    const dataUrl = await QRCode.toDataURL(qrData, {
                        errorCorrectionLevel: 'H',
                        type: 'image/png',
                        quality: 0.92,
                        margin: 1,
                    });
                    setQrCodeDataUrl(dataUrl);
                } else {
                    setIsAuthorized(false);
                }

            } catch (error) {
                console.error("Failed to fetch receipt data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formId, applicationId, user, isAdmin, authLoading]);

    const handlePrint = () => {
        window.print();
    };
    
    if (loading || authLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthorized) {
         return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <p className="text-2xl font-bold">Access Denied</p>
                <p>You do not have permission to view this receipt.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/admission">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Link>
                </Button>
            </div>
        );
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
    
    let coachingName = formDetails.className || '';

    return (
        <div className="flex min-h-screen flex-col bg-secondary/30">
            <Header className="print-hidden" />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                     <div className="flex justify-between items-center mb-8 print-hidden">
                        <Button asChild variant="outline">
                            <Link href="/admission">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admissions
                            </Link>
                        </Button>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Save pdf
                        </Button>
                    </div>

                    <div className="bg-background p-8 rounded-lg shadow-2xl border print-receipt-container">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-extrabold tracking-tight text-primary">{coachingName}</h1>
                                <p className="text-muted-foreground text-lg">Admission Receipt</p>
                                <p className="text-sm text-muted-foreground">{formDetails.title} ({formDetails.year})</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Application ID</p>
                                <p className="font-mono text-sm text-muted-foreground">{application.id}</p>
                                <p className="font-semibold mt-2">Date</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(application.submittedAt), 'PPP')}</p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-12 gap-8">
                             {/* Main Details Column */}
                            <div className="col-span-12 md:col-span-8 space-y-6">
                                {/* Personal Details */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-primary flex items-center gap-2"><User />Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <ReceiptDetail label="Full Name" value={application.fullName} />
                                        <ReceiptDetail label="Date of Birth" value={format(new Date(application.dateOfBirth), 'PPP')} />
                                        <ReceiptDetail label="Gender" value={application.gender} />
                                        <ReceiptDetail label="Category" value={application.category} />
                                        <ReceiptDetail label="Student Phone" value={application.studentPhone} />
                                        <ReceiptDetail label="Village/City" value={application.address} />
                                    </div>
                                </section>
                                 {/* Parent Details */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-primary flex items-center gap-2"><Home />Parent Details</h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <ReceiptDetail label="Father's Name" value={application.fatherName} />
                                        <ReceiptDetail label="Father's Occupation" value={application.fatherOccupation} />
                                        <ReceiptDetail label="Mother's Name" value={application.motherName} />
                                        <ReceiptDetail label="Parent/Guardian Phone" value={application.parentPhone} />
                                    </div>
                                </section>
                                {/* Academic Details */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-primary flex items-center gap-2"><Book />Academic Details</h3>
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                                        <ReceiptDetail label="Previous School" value={application.previousSchool} />
                                        <ReceiptDetail label="Board" value={application.board} />
                                        <ReceiptDetail label="10th Percentage" value={application.percentage} />
                                    </div>
                                </section>
                            </div>
                            
                            {/* Right Column with QR and Payment */}
                            <div className="col-span-12 md:col-span-4 space-y-6">
                                {/* Teacher Details */}
                                <section className="bg-secondary/50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-primary">Teacher Details</h3>
                                    <div className="space-y-3">
                                        <ReceiptDetail label="Teacher Name" value={formDetails.teacherName} />
                                        <ReceiptDetail label="Contact" value={formDetails.contactNo} />
                                    </div>
                                </section>
                                 {/* Payment Details */}
                                <section className="bg-secondary/50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-primary flex items-center gap-2"><CreditCard />Payment Details</h3>
                                    <div className="space-y-3">
                                        <ReceiptDetail label="Total Fees" value={`₹${formDetails.totalFees.toLocaleString()}`} />
                                        {application.paymentMode === 'Online' ? (
                                            <ReceiptDetail label="Amount Paid" value={application.paymentAmount ? `₹${application.paymentAmount}` : 'N/A'} />
                                        ) : (
                                            <ReceiptDetail label="Advance to be Paid" value={`₹${formDetails.advanceFees.toLocaleString()}`} />
                                        )}
                                        <ReceiptDetail label="Payment Mode" value={application.paymentMode} />
                                        
                                        {application.paymentMode === 'Online' && (
                                            <>
                                                <ReceiptDetail label="Sender Name" value={application.senderName} />
                                                <ReceiptDetail label="Transaction Date" value={application.transactionDate} />
                                            </>
                                        )}
                                    </div>
                                </section>
                                {/* QR Code */}
                                {qrCodeDataUrl && (
                                    <div className="flex flex-col items-center justify-center bg-secondary/50 p-4 rounded-lg">
                                        <img src={qrCodeDataUrl} alt="Application QR Code" className="w-28 h-28" />
                                        <p className="text-xs text-muted-foreground mt-2">Scan for details</p>
                                         <Button onClick={handlePrint} className="w-full mt-4 print-hidden">
                                            <Printer className="mr-2 h-4 w-4" /> Save pdf
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Footer */}
                        <div className="border-t mt-8 pt-4 text-center text-xs text-muted-foreground">
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                            <p>&copy; {new Date().getFullYear()} {coachingName}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
