
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Send, Download, Bookmark, Users, LogIn, UserPlus, FileText, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary/10 to-background">
          <div className="container px-4 md:px-6">
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
                       <Link href="/about">Learn More</Link>
                     </Button>
                   </div>
                </div>
              </div>
              <Image
                src="https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                width="600"
                height="400"
                alt="A group of people studying together."
                data-ai-hint="group study"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">What We Offer</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Your All-in-One Learning Hub</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From comprehensive notes to AI-powered tools, find everything you need to excel in your studies.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Study Notes</CardTitle>
                  <Download className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <CardDescription>High-quality, comprehensive study notes for various subjects and competitive exams, available for free.</CardDescription>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">AI-Powered Test Maker</CardTitle>
                  <FileText className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Generate personalized practice tests from our resources to sharpen your knowledge and exam readiness.</CardDescription>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">AI Assistant</CardTitle>
                  <Lightbulb className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Have a doubt? Ask our AI assistant for instant clarification on any topic, anytime.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground mb-4">Your Privacy Matters</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">We Guarantee Your Data's Security</h2>
                        <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                            Your trust is our top priority. We are committed to protecting your personal information and ensuring your learning environment is safe and secure. We use industry-standard encryption and never share your data without your consent.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/privacy">
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Read Our Privacy Policy
                            </Link>
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        <ShieldCheck className="h-48 w-48 text-primary/20" />
                    </div>
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
