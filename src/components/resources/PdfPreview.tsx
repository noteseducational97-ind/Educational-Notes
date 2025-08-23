
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Card, CardContent } from '../ui/card';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type PdfPreviewProps = {
    url: string;
    title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }
    
    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));
    const zoomIn = () => setScale(prev => prev + 0.1);
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    if (!url) {
        return (
            <div className="border rounded-lg h-[800px] flex items-center justify-center bg-muted/50">
                <p className="text-muted-foreground">PDF preview is not available.</p>
            </div>
        )
    }

    return (
       <Card>
        <div className="bg-muted/50 p-2 rounded-t-lg flex items-center justify-center gap-2 sticky top-0 z-10">
            <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant="ghost" size="sm">
                <ChevronLeft />
                Prev
            </Button>
            <span className="text-sm font-medium">
                Page {pageNumber} of {numPages || '--'}
            </span>
            <Button onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} variant="ghost" size="sm">
                Next
                <ChevronRight />
            </Button>
            <div className="border-l h-6 mx-2" />
             <Button onClick={zoomOut} variant="ghost" size="icon">
                <ZoomOut />
            </Button>
            <Button onClick={zoomIn} variant="ghost" size="icon">
                <ZoomIn />
            </Button>
            <Button onClick={rotate} variant="ghost" size="icon">
                <RotateCw />
            </Button>
        </div>
        <CardContent className="p-2 h-[800px] overflow-auto flex justify-center">
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<LoadingSpinner className='min-h-0'/>}
                error={<p className='text-destructive'>Failed to load PDF file.</p>}
                title={title}
            >
                <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    loading={<LoadingSpinner className='min-h-0'/>}
                />
            </Document>
        </CardContent>
       </Card>
    );
}
