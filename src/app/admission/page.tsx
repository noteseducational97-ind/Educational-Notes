'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { getAdmissionForms } from '@/lib/firebase/admissions';
import type { AdmissionForm } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdmissionPage() {
    const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdmissionForms()
            .then(setAdmissionForms)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Admissions Open</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Choose the program you are interested in and proceed with the admission process.
                </p>
            </div>
            
            {admissionForms.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {admissionForms.map((form) => (
                        <Card key={form.id} className="flex flex-col justify-between bg-secondary/30 p-6">
                            <div>
                                <CardTitle className="text-2xl">{form.title}</CardTitle>
                                <CardDescription className="mt-2">{form.description}</CardDescription>
                            </div>
                            <Button asChild className="w-full mt-6">
                            <Link href={`/admission/${form.id}`}>
                                Admission Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-card/50 p-12 text-center max-w-2xl mx-auto">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold">No Admissions Currently Open</h2>
                    <p className="mt-2 text-muted-foreground">
                        Please check back later for new admission announcements.
                    </p>
                </div>
            )}

             <div className="text-center mt-16">
                 <h2 className="text-2xl font-semibold">Have Questions?</h2>
                 <p className="mt-2 text-muted-foreground">
                     Feel free to contact us for any admission-related inquiries.
                 </p>
                 <Button variant="outline" className="mt-4" asChild>
                    <a href="mailto:noteseducational97@gmail.com">Contact Us</a>
                 </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
