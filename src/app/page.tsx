
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ArrowRight, Download, Bookmark, Users, LogIn, UserPlus, FileText, Lightbulb, BrainCircuit, BookCheck, ClipboardList, BookCopy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const features = [
    {
        icon: <Download className="h-6 w-6 text-primary" />,
        title: 'Study Notes',
        description: 'High-quality, comprehensive study notes for various subjects and competitive exams, available for free.',
        href: '/downloads',
    },
    {
        icon: <BookCheck className="h-6 w-6 text-primary" />,
        title: 'Previous Year Questions',
        description: 'Access a vast library of past exam papers (PYQs) to understand patterns and practice effectively.',
        href: '/downloads',
    },
    {
        icon: <ClipboardList className="h-6 w-6 text-primary" />,
        title: 'Syllabus & Exam Guides',
        description: 'Stay on track with detailed syllabus breakdowns and exam patterns for various boards and entrance tests.',
        href: '/downloads',
    },
    {
        icon: <Bookmark className="h-6 w-6 text-primary" />,
        title: 'Personalized Watchlist',
        description: 'Save and organize your most important resources for quick and easy access whenever you need them.',
        href: '/save',
    }
];

export default function Home() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    Your Ultimate Advantage for Exam Success
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tighter">
                    Your Success, Our Mission
                </h1>
                <p className="max-w-xl text-lg text-foreground/80">
                    High-quality study materials, expert-curated content—all completely free. Achieve academic excellence with us.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   {!user && (
                        <Button size="lg" asChild>
                            <Link href="/signup">Get Started <ArrowRight /></Link>
                        </Button>
                    )}
                     <Button size="lg" variant="secondary" asChild>
                        <Link href="/downloads">Explore Resources</Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">What We Offer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                From comprehensive notes to practice tools, find everything you need to excel in your studies.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="group flex flex-col h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 active:shadow-md"
                  onClick={() => router.push(feature.href)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {feature.icon}
                          <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div
            className="container grid items-center justify-center gap-4 px-4 text-center md:px-6"
          >
            <div className="space-y-3 max-w-2xl mx-auto rounded-lg bg-background/80 backdrop-blur-sm p-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-balance">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground text-balance">
                Create an account today to unlock a world of knowledge and save your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    <UserPlus />
                    Sign Up for Free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/login">
                    <LogIn />
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
