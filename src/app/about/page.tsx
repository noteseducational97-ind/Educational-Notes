
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AboutPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/#about');
    }, [router]);

    return <LoadingSpinner />;
}
