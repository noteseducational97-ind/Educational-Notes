
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdmissionSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    const applicationId = params.applicationId as string;
    const formId = searchParams.get('formId');
    const name = searchParams.get('name');

    useEffect(() => {
        // This is just to ensure the page has mounted and can render the data
        if (applicationId && formId && name) {
            setLoading(false);
        }
    }, [applicationId, formId, name]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto p-4"
                    viewport={{ once: false }}
                >
                    <Card className="text-center shadow-lg">
                        <CardHeader>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="mt-4 text-2xl font-bold">Application Successful!</CardTitle>
                            <CardDescription>
                                Congratulations, {name}! Your application has been submitted successfully.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                You can now download a copy of your admission receipt for your records.
                            </p>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button asChild className="w-full" size="lg">
                                <Link href={`/admission/receipt/${formId}/${applicationId}`}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Receipt
                                </Link>
                            </Button>
                             <Button asChild variant="outline" className="w-full">
                                <Link href="/admission">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Admissions
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
