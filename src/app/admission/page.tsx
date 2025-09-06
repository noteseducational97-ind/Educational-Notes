
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const admissionForms = [
    {
        title: 'Class 11 and 12',
        description: 'Admission for MHT-CET, NEET, and JEE preparation batches.',
        status: 'Coming Soon',
        href: '#'
    },
    {
        title: 'Commerce Stream (XI & XII)',
        description: 'Admission for foundational commerce and accountancy courses.',
        status: 'Coming Soon',
        href: '#'
    },
    {
        title: 'Foundation Courses (IX & X)',
        description: 'Build a strong base in Science and Mathematics for future competitive exams.',
        status: 'Coming Soon',
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {admissionForms.map((form) => (
                    <Card key={form.title} className="flex flex-col bg-secondary/30">
                        <CardHeader>
                            <CardTitle>{form.title}</CardTitle>
                            <CardDescription>{form.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {/* Content can be added here if needed */}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled={form.status !== 'Open'}>
                                {form.status === 'Coming Soon' ? 'Coming Soon' : <>Apply Now <ArrowRight className="ml-2 h-4 w-4" /></>}
                            </Button>
                        </CardFooter>
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
