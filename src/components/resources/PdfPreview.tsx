
'use client';

import LoadingSpinner from '../shared/LoadingSpinner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';
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
    
    // Use Google Docs viewer for robust embedding
    const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    return (
       <Card>
        <CardContent className="p-0 h-[800px] overflow-hidden flex flex-col">
            <iframe
                src={embedUrl}
                title={title}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 'none' }}
            >
                <p>Your browser does not support iframes.</p>
            </iframe>
        </CardContent>
       </Card>
    );
}
