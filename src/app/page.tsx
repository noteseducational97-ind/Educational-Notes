
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Send, BookOpen, Quote, Download, Bookmark, Users } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
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
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Welcome To Educational Notes
                  </h1>
                   <p className="max-w-[600px] text-muted-foreground md:text-xl">Your Mission To Achieve Best Educational Material with High Quality Notes with all things related to study but free of cost</p>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Curated Resources</CardTitle>
                            <Download className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">Access a library of hand-picked study materials.</p>
                           <Button asChild variant="link" className="px-0">
                               <Link href="/downloads">Explore Downloads</Link>
                           </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Personal Watchlist</CardTitle>
                            <Bookmark className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">Save and organize your most important materials.</p>
                           <Button asChild variant="link" className="px-0">
                               <Link href="/save">Go to Watchlist</Link>
                           </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Community Support</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">Connect with fellow learners and grow together.</p>
                           <Button asChild variant="link" className="px-0">
                               <Link href="/about">Learn More</Link>
                           </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-secondary/50">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <Quote className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">An Investment in Knowledge Pays the Best Interest</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        - Benjamin Franklin
                    </p>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
