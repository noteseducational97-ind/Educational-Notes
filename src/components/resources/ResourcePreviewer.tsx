
'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const PdfPreview = dynamic(() => import('@/components/resources/PdfPreview'), {
  ssr: false,
  loading: () => <div className="h-[800px] flex items-center justify-center"><LoadingSpinner className="min-h-0" /></div>,
});

type ResourcePreviewerProps = {
    url: string;
    title: string;
}

export default function ResourcePreviewer({ url, title }: ResourcePreviewerProps) {
    return <PdfPreview url={url} title={title} />;
}
