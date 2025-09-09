
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import ResourcePreviewer from '@/components/resources/ResourcePreviewer';
import ResourceActions from '@/components/resources/ResourceActions';
import { motion } from 'framer-motion';
import type { Resource } from '@/types';

type ResourceDetailClientProps = {
    resource: Resource;
    fromAdmin: boolean;
};

export default function ResourceDetailClient({ resource, fromAdmin }: ResourceDetailClientProps) {
  const backUrl = fromAdmin ? '/admin/downloads' : '/downloads';
  const testableCategories = ["Notes", "Textual Answer", "Important Point"];
  const isTestable = resource.category.some(c => testableCategories.includes(c));

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <Header />
      <main className="flex-1 py-8">
        <motion.div 
          className="container mx-auto max-w-7xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
            <div className="mb-4">
                <Button asChild variant="outline">
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Downloads
                    </Link>
                </Button>
            </div>
            
            <div className="bg-primary/10 p-6 md:p-8 rounded-lg mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Uploaded on {format(new Date(resource.createdAt), 'MMMM dd, yyyy')}</span>
                </div>
                <h1 className="text-4xl font-bold text-primary">{resource.title}</h1>
                <p className="text-xl mt-2 text-foreground/80">
                    Explore the details and download the content below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
              <div className="lg:col-span-2">
                <ResourcePreviewer title={resource.title} url={resource.viewPdfUrl} />
              </div>

              <div className="lg:col-span-1">
                <Card className="shadow-xl sticky top-24">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2 border-b pb-1">Description</h3>
                            <p className="text-muted-foreground text-sm">{resource.content}</p>
                        </div>
                        <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-semibold'>Category:</span>
                            {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                        </div>
                        <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-semibold'>Subject:</span>
                            {resource.subject.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                        </div>
                        {resource.class && (
                            <div className='flex flex-wrap items-center gap-2'>
                                <span className='font-semibold'>Class:</span>
                                <Badge variant="outline">Class {resource.class}</Badge>
                            </div>
                        )}
                        <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-semibold'>Stream:</span>
                            {resource.stream.map(s => <Badge key={s}>{s}</Badge>)}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 border-t pt-4">
                        <h3 className="text-lg font-semibold">Actions</h3>
                        <ResourceActions resource={resource} isTestable={isTestable}/>
                    </CardFooter>
                </Card>
              </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
}
