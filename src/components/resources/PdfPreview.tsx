
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';

type PdfPreviewProps = {
    url: string;
    title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
    
    if (!url || !url.startsWith('https://')) {
        return (
            <Card className="h-full flex items-center justify-center bg-muted/50">
                <CardHeader>
                    <CardTitle>Preview Not Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A valid preview URL is not available for this resource.</p>
                </CardContent>
            </Card>
        )
    }
    
    // Construct the Google Docs Viewer URL
    const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    return (
       <Card className="h-full flex flex-col">
            <CardHeader className="flex-row items-center justify-between border-b p-4">
                <CardTitle className="text-lg">{title}</CardTitle>
                 <Button asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Fullscreen
                    </a>
                </Button>
            </CardHeader>
            <CardContent className="p-0 h-[800px] w-full">
                <iframe
                    src={embedUrl}
                    title={title}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                >
                </iframe>
            </CardContent>
       </Card>
    );
}
