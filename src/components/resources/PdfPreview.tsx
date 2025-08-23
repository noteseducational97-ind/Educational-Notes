
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useState, useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfPreviewProps = {
    url: string;
    title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const { width, ref } = useResizeDetector();

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
    }
    
    if (!url) {
        return (
            <Card className="h-full flex items-center justify-center bg-muted/50">
                <CardHeader>
                    <CardTitle>Preview Not Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A preview could not be loaded for this resource.</p>
                </CardContent>
            </Card>
        )
    }

    return (
       <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between border-b p-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1.5'>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="previous page"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className='h-4 w-4' />
                    </Button>
                     <div className='flex items-center gap-1.5'>
                        <p className='text-zinc-900 text-sm'>
                            <span>{currentPage}</span> / <span>{numPages ?? 'x'}</span>
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="next page"
                        onClick={() => setCurrentPage(prev => (numPages ? Math.min(prev + 1, numPages) : prev + 1))}
                        disabled={!numPages || currentPage >= numPages}
                    >
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" aria-label="zoom out" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut /></Button>
                    <Button variant="outline" size="icon" aria-label="zoom in" onClick={() => setScale(s => Math.min(2.5, s + 0.1))}><ZoomIn /></Button>
                 </div>
            </div>
        </CardHeader>
        <CardContent className="p-2 h-[800px] overflow-auto flex justify-center" ref={ref}>
            <Document
                file={{ url }}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<LoadingSpinner className='min-h-0'/>}
                error={<div className='text-destructive p-4'>Error loading PDF. Please try viewing it directly.</div>}
            >
                <Page 
                    pageNumber={currentPage} 
                    width={width ? width : 1}
                    scale={scale}
                />
            </Document>
        </CardContent>
       </Card>
    );
}
