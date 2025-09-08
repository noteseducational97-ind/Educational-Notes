
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';
import Header from '@/components/layout/Header';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card text-card-foreground animate-fade-in-up">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
                <Link href="/" className="flex items-center space-x-2 text-foreground">
                    <EducationalNotesLogo className="h-8 w-8 text-primary" />
                </Link>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col items-center">
            <div className="text-center text-sm">
                <Link href="/forgot-password" passHref>
                    <span className="underline cursor-pointer text-muted-foreground hover:text-primary">Forgot your password?</span>
                </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
