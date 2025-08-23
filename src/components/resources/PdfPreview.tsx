
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

    return (
        <div className="border rounded-lg overflow-hidden h-[800px] relative group">
             <object data={url} type="application/pdf" className="w-full h-full">
                <p className="p-4 text-center text-muted-foreground">
                    Your browser does not support embedded PDFs.
                    <Button asChild variant="link">
                        <Link href={url} target="_blank" rel="noopener noreferrer">Click here to view the PDF in a new tab.</Link>
                    </Button>
                </p>
            </object>
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
