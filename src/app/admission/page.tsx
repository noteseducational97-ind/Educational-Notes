
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const admissionForms = [
    {
        title: 'Class 11 and 12',
        description: 'Admission For Class 11 and 12. Science Student',
        status: 'Open',
        href: '#'
    },
    {
        title: 'MHT-CET',
        description: 'Admissions Form for MHT-CET Maharashtra',
        status: 'Open',
        href: '#'
    }
];

export default function AdmissionPage() {
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
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {admissionForms.map((form) => (
                    <Card key={form.title} className="flex flex-col justify-between bg-secondary/30 p-6">
                        <div>
                            <h3 className="text-2xl font-semibold leading-none tracking-tight">{form.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{form.description}</p>
                        </div>
                        <Button asChild className="w-full mt-6" disabled={form.status !== 'Open'}>
                           <Link href={form.href}>
                             {form.status === 'Coming Soon' ? 'Coming Soon' : <>Apply Now <ArrowRight className="ml-2 h-4 w-4" /></>}
                           </Link>
                        </Button>
                    </Card>
                ))}
            </div>
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
