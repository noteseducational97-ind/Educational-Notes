
'use client';

import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';

type PdfPreviewProps = {
    url: string;
    title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
    if (!url) {
        return (
            <div className="border rounded-lg h-[800px] flex items-center justify-center bg-muted/50">
                <p className="text-muted-foreground">PDF preview is not available.</p>
            </div>
        )
    }

    // Append parameters to the PDF URL to hint at hiding the toolbar and other controls
    const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    return (
        <div className="border rounded-lg overflow-hidden h-[800px] relative group">
            <iframe 
                src={googleDocsViewerUrl}
                className="w-full h-full"
                title={`${title} PDF Preview`}
                allowFullScreen
                frameBorder="0"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button asChild>
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Fullscreen
                    </Link>
                </Button>
            </div>
        </div>
    );
}
