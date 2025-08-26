'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MailCheck, Send, LogIn } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleResendVerification = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You are not logged in.',
      });
      return;
    }
    setResendLoading(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Email Sent',
        description: 'A new verification link has been sent to your email address.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
            <MailCheck className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold tracking-tight text-primary">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <br/><strong>{user?.email || 'your email address'}</strong>.
            <br/> Please check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?
          </p>
          <Button onClick={handleResendVerification} disabled={resendLoading || !user}>
            {resendLoading ? <Loader2 className="animate-spin" /> : <Send />}
            Resend Verification Email
          </Button>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
            <p className="text-xs text-muted-foreground pt-4">
            After verifying, you can proceed to log in.
            </p>
             <Button variant="outline" asChild>
                <Link href="/login">
                    <LogIn />
                    Go to Login
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
