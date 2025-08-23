
'use client';

import { Card, CardContent } from '../ui/card';

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
            />
        </CardContent>
       </Card>
    );
}
