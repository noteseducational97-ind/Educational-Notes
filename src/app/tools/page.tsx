
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ToolsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/#tools');
    }, [router]);

    return <LoadingSpinner />;
}
