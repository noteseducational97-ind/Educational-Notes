
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowRight, 
    Download, 
    Bookmark, 
    UserPlus, 
    LogIn, 
    BookCheck, 
    ClipboardList, 
    Users, 
    Mail, 
    Phone,
    Calculator,
    Copy,
    Wrench,
    ClipboardEdit
} from 'lucide-react';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';

const features = [
    {
        icon: <Download className="h-8 w-8 text-primary" />,
        title: 'Study Notes',
        description: 'High-quality, comprehensive study notes for various subjects and competitive exams, available for free.',
        href: '/downloads',
    },
    {
        icon: <BookCheck className="h-8 w-8 text-primary" />,
        title: 'Previous Year Questions',
        description: 'Access a vast library of past exam papers (PYQs) to understand patterns and practice effectively.',
        href: '/downloads',
    },
    {
        icon: <ClipboardList className="h-8 w-8 text-primary" />,
        title: 'Syllabus & Exam Guides',
        description: 'Stay on track with detailed syllabus breakdowns and exam patterns for various boards and entrance tests.',
        href: '/downloads',
    },
    {
        icon: <Bookmark className="h-8 w-8 text-primary" />,
        title: 'Personalized Watchlist',
        description: 'Save and organize your most important resources for quick and easy access whenever you need them.',
        href: '/save',
    }
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent via-transparent"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                    Your Ultimate Advantage for Exam Success
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 tracking-tight">
                    Your Success, Our Mission
                </h1>
                <p className="max-w-xl text-lg text-foreground/80">
                    High-quality study materials, expert-curated content—all completely free. Achieve academic excellence with us.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                   {!user ? (
                        <Button size="lg" asChild>
                            <Link href="/signup">Get Started <ArrowRight /></Link>
                        </Button>
                    ) : (
                        <Button size="lg" asChild>
                            <Link href="/profile">My Profile <ArrowRight /></Link>
                        </Button>
                    )}
                     <Button size="lg" variant="secondary" asChild>
                        <Link href="/downloads">Explore Resources</Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">What We Offer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                From comprehensive notes to practice tools, find everything you need to excel in your studies.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="group flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50 bg-background/50 border-border"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
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
        
        {/* Mission Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Our Mission</h2>
                </div>
                <Card className="bg-secondary/30">
                    <CardContent className="p-6">
                        <div className="space-y-4 text-muted-foreground text-lg text-center">
                            <p className="leading-relaxed">
                                At Educational Notes, our vision is to empower every student with high-quality, emotionally supportive learning resources that foster academic success and personal growth.
                            </p>
                            <p className="leading-relaxed">
                                We proudly serve students preparing for competitive exams like NEET, JEE, MHT-CET, and those seeking to build a strong foundation in their academic subjects. Our platform is built on the principles of accessibility, affordability, and trust, ensuring that every learner—regardless of background—can thrive.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div
            className="container grid items-center justify-center gap-8 px-4 text-center md:px-6"
          >
            <div className="space-y-4 max-w-2xl mx-auto rounded-lg bg-secondary/30 backdrop-blur-sm p-8 border">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-balance">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground text-balance">
                Create an account today to unlock a world of knowledge and save your progress.
              </p>
              {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg">
                      <Link href="/signup">
                        <UserPlus />
                        Sign Up for Free
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/login">
                        <LogIn />
                        Sign In
                      </Link>
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
