
import { getResourceById } from '@/lib/firebase/resources';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CalendarIcon, ExternalLink, FileText, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import TestMakerButton from '@/components/resources/TestMakerButton';
import PdfPreview from '@/components/resources/PdfPreview';

type Props = {
  params: { id: string };
};

export default async function ResourceDetailPage({ params }: Props) {
  const resource = await getResourceById(params.id);

  if (!resource) {
    notFound();
  }

  const isLinkDisabled = resource.isComingSoon || !resource.pdfUrl;

  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(resource.viewPdfUrl || '')}&embedded=true`;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-4">
                <Button asChild variant="outline">
                    <Link href="/downloads">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Downloads
                    </Link>
                </Button>
            </div>
            <Card className="overflow-hidden shadow-xl">
                <CardHeader className="p-0">
                     <div className="bg-primary/10 p-6 md:p-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                           <CalendarIcon className="h-4 w-4" />
                           <span>Uploaded on {format(new Date(resource.createdAt), 'MMMM dd, yyyy')}</span>
                        </div>
                        <CardTitle className="text-4xl font-bold text-primary">{resource.title}</CardTitle>
                        <CardDescription className="text-xl mt-2 text-foreground/80">
                          Explore the details and download the content below.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-8 order-1">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Preview</h2>
                            <PdfPreview title={resource.title} url={googleDocsViewerUrl} />
                        </div>
                    </div>
                    <div className="space-y-6 order-2">
                         <div>
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Description</h2>
                            <p className="text-muted-foreground">{resource.content}</p>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className='flex flex-wrap gap-1'>
                                 <span className='font-semibold'>Category:</span>
                                 {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                               </div>
                                <div className='flex flex-wrap gap-1'>
                                 <span className='font-semibold'>Subject:</span>
                                 {resource.subject.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                               </div>
                               {resource.class && (
                                   <div className='flex flex-wrap gap-1'>
                                     <span className='font-semibold'>Class:</span>
                                     <Badge variant="outline">Class {resource.class}</Badge>
                                   </div>
                               )}
                                <div className='flex flex-wrap gap-1'>
                                 <span className='font-semibold'>Stream:</span>
                                 {resource.stream.map(s => <Badge key={s}>{s}</Badge>)}
                               </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                                <h3 className="text-lg font-semibold">Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild disabled={isLinkDisabled}>
                                        <Link href={resource.viewPdfUrl || '#'} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View PDF
                                        </Link>
                                    </Button>
                                    <Button asChild disabled={isLinkDisabled}>
                                        <Link href={resource.pdfUrl || '#'} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </Link>
                                    </Button>
                                    <TestMakerButton resource={resource} disabled={isLinkDisabled} />
                                    <Button variant="secondary">
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Answer Question
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

// This helps Next.js to not statically generate pages for every resource at build time
export async function generateStaticParams() {
    return [];
}
