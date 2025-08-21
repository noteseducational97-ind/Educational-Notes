
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Send, Download, Bookmark, Users, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification email sent',
        description: 'Check your inbox to verify your account.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error sending email',
        description: error.message,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary/20 to-background">
          <div className="container px-4 md:px-6">
             {user && !user.emailVerified && (
              <Alert className="mb-8 border-yellow-500/50 text-yellow-700 dark:border-yellow-500/50 dark:bg-yellow-900/20">
                <ShieldCheck className="h-4 w-4 !text-yellow-500" />
                <AlertTitle className="font-bold !text-yellow-700 dark:!text-yellow-400">Verify your email address</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between !text-yellow-600 dark:!text-yellow-400/80">
                  <span>Please check your inbox to verify your account for full access.</span>
                  <Button variant="link" onClick={handleResendVerification} className="p-0 h-auto text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 mt-2 sm:mt-0">
                    <Send />
                    Resend verification email
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl xl:text-6xl/none">
                    Welcome To Educational Notes
                  </h1>
                   <p className="max-w-[600px] text-foreground/80 md:text-xl">Your mission to achieve the best educational material with high-quality notes, all free of cost.</p>
                   <div className="flex flex-col gap-2 min-[400px]:flex-row">
                     <Button size="lg" asChild>
                       <Link href="/downloads">Get Started</Link>
                     </Button>
                     <Button size="lg" variant="outline" asChild>
                       <Link href="/downloads">Explore Resources</Link>
                     </Button>
                   </div>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                width="600"
                height="400"
                alt="A group of diverse students studying together outdoors on a university campus."
                data-ai-hint="students studying campus"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform provides curated resources, community support, and tools to help you on your learning journey.
                  </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/downloads" className="block hover:shadow-lg transition-shadow duration-300 rounded-xl">
                        <Card className="h-full cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">Curated Resources</CardTitle>
                                <Download className="h-6 w-6 text-primary"/>
                            </CardHeader>
                            <CardContent>
                               <CardDescription>Access a library of hand-picked study materials, notes, and guides to supplement your learning.</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/save" className="block hover:shadow-lg transition-shadow duration-300 rounded-xl">
                        <Card className="h-full cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">Personal Watchlist</CardTitle>
                                <Bookmark className="h-6 w-6 text-primary"/>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Save and organize your most important materials for quick and easy access whenever you need them.</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                     <Link href="/about" className="block hover:shadow-lg transition-shadow duration-300 rounded-xl">
                        <Card className="h-full cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">Community Support</CardTitle>
                                <Users className="h-6 w-6 text-primary"/>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Connect with fellow learners, ask questions, and share knowledge in a supportive environment.</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-primary/10">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to start your journey?</h2>
                    <p className="text-muted-foreground">
                        Create an account today and unlock a world of knowledge.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild size="lg">
                        <Link href="/signup">
                          <UserPlus />
                          Sign Up
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
