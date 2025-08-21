
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Send, BookOpen, Quote } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          {!user.emailVerified && (
            <Alert className="mb-6 border-yellow-500/50 text-yellow-700 dark:border-yellow-500/50 dark:bg-yellow-900/20">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <BookOpen className="h-10 w-10 text-primary" />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Welcome, {user.displayName || 'User'}!</h1>
                        <p className="text-muted-foreground">Logged in as: <strong>{user.email}</strong></p>
                    </div>
                </div>
              <Card className="bg-card/50 border-border/50 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Quote className="h-8 w-8 text-primary/70 shrink-0 mt-1" />
                        <blockquote className="space-y-2">
                            <p className="text-lg font-medium text-foreground">
                            "The beautiful thing about learning is that no one can take it away from you."
                            </p>
                            <footer className="text-sm text-muted-foreground">- B.B. King</footer>
                        </blockquote>
                    </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Image 
                src="https://placehold.co/600x400.png"
                alt="Person studying in a modern library"
                data-ai-hint="person studying"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl object-cover aspect-video"
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
