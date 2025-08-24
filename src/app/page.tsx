
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ArrowRight, Download, Bookmark, Users, LogIn, UserPlus, FileText, Lightbulb, BrainCircuit, BookCheck, ClipboardList, BookCopy } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

const features = [
    {
        icon: <Download className="h-6 w-6 text-primary" />,
        title: 'Study Notes',
        description: 'High-quality, comprehensive study notes for various subjects and competitive exams, available for free.',
        href: '/downloads',
    },
    {
        icon: <FileText className="h-6 w-6 text-primary" />,
        title: 'AI-Powered Test Maker',
        description: 'Generate personalized practice tests from our resources to sharpen your knowledge and exam readiness.',
        href: '/ask',
    },
    {
        icon: <Lightbulb className="h-6 w-6 text-primary" />,
        title: 'Instant AI Assistant',
        description: 'Have a doubt? Ask our AI assistant for instant clarification on any topic, anytime.',
        href: '/ask',
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 dark:from-yellow-800/50 dark:via-orange-900/50 dark:to-red-950/50">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col items-start text-left space-y-6">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-foreground">
                        Your All-in-One Learning Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tighter">
                        Unlock Your Potential, One Note at a Time.
                    </h1>
                    <p className="max-w-xl text-lg text-foreground/80">
                        High-quality study materials, AI-powered tools, and expert-curated content—all completely free. Achieve academic excellence with us.
                    </p>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                       {!user && (
                            <Button size="lg" asChild>
                                <Link href="/signup">Get Started <ArrowRight /></Link>
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="flex justify-center">
                    <Image
                        src="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                        width="600"
                        height="400"
                        alt="Student studying"
                        data-ai-hint="student study"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-2xl"
                    />
                </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">What We Offer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                From comprehensive notes to AI-powered tools, find everything you need to excel in your studies.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50 flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                        {feature.icon}
                        <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-primary hover:text-primary" asChild>
                        <Link href={feature.href}>Learn More <ArrowRight /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div className="flex justify-center">
                        <Image
                            src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                            width="500"
                            height="500"
                            alt="AI concept image"
                            data-ai-hint="abstract technology"
                            className="rounded-full aspect-square object-cover shadow-2xl"
                        />
                    </div>
                    <div>
                        <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4">artificial intelligence</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-balance">Meet Your Own Personalize Ai Assistant</h2>
                        <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed text-balance">
                           Our AI assistant is here to break down complex topics, answer your toughest questions, and even generate practice tests from any resource. It's like having a personal tutor available 24/7.
                        </p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href="/ask">
                                <Lightbulb className="mr-2 h-5 w-5" />
                                Try the Assistant
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div
            className="container grid items-center justify-center gap-4 px-4 text-center md:px-6"
            style={{
              backgroundImage: 'radial-gradient(circle at center, var(--tw-color-primary-foreground), transparent)',
              backgroundSize: '150% 150%',
              backgroundPosition: 'center',
            }}
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
