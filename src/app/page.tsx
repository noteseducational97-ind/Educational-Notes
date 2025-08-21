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
import { ShieldCheck, Send } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col bg-background dark:bg-gray-950">
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">Welcome, {user.displayName || 'User'}!</h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
              This is your main dashboard. You have successfully authenticated and can now access all the features of the application.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Logged in as: <strong>{user.email}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
