
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
import { useRouter } from 'next/navigation';

export default function AdmissionSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    const applicationId = params.applicationId as string;
    const formId = searchParams.get('formId');
    const name = searchParams.get('name');

    useEffect(() => {
        // This is just to ensure the page has mounted and can render the data
        if (applicationId && formId && name) {
            setLoading(false);
            // Redirect to receipt page immediately
            router.replace(`/admission/receipt/${formId}/${applicationId}`);
        } else {
             // If query params are missing, redirect to a safe page
            router.replace('/admission');
        }
    }, [applicationId, formId, name, router]);

    // This page will briefly show a spinner while it redirects.
    return <LoadingSpinner />;
}
