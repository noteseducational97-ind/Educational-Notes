
import { getResourceById } from '@/lib/firebase/resources';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CalendarIcon, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Props = {
  params: { id: string };
};

export default async function ResourceDetailPage({ params }: Props) {
  const resource = await getResourceById(params.id);

  if (!resource) {
    notFound();
  }

  const isLinkDisabled = resource.isComingSoon || !resource.pdfUrl;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-5xl px-4">
            <Card className="overflow-hidden shadow-xl">
                <CardHeader className="p-0">
                     <div className="bg-primary/10 p-6 md:p-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                           <CalendarIcon className="h-4 w-4" />
                           <span>Uploaded on {format(new Date(resource.createdAt), 'MMMM dd, yyyy')}</span>
                        </div>
                        <CardTitle className="text-4xl font-bold text-primary">{resource.title}</CardTitle>
                        <CardDescription className="text-xl mt-2 text-foreground/80">
                          Explore the details and preview the content below.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                             <h2 className="text-2xl font-semibold mb-4 border-b pb-2">PDF Preview</h2>
                             <div className="aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden">
                                 <iframe 
                                    src={resource.viewPdfUrl || resource.pdfUrl}
                                    className="w-full h-[800px]"
                                    title={`${resource.title} PDF Preview`}
                                    allowFullScreen
                                />
                             </div>
                        </div>
                    </div>
                    <aside className="space-y-6">
                        <div className="relative aspect-video w-full">
                           <Image 
                                src={isLinkDisabled ? 'https://placehold.co/600x400.png' : resource.imageUrl || 'https://placehold.co/600x400.png'}
                                alt={resource.title}
                                fill
                                className={cn("object-cover rounded-lg", isLinkDisabled && "filter grayscale")}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Details</h3>
                            <div className="flex flex-col gap-2">
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
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground">
                                <p>{resource.content}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Actions</h3>
                            <div className="flex flex-col gap-2">
                                <Button asChild disabled={isLinkDisabled}>
                                    <Link href={resource.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </aside>
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
