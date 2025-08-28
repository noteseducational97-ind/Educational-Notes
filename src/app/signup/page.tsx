
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import SignUpForm from '@/components/auth/SignUpForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';
import Header from '@/components/layout/Header';

export default function SignUpPage() {
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
    <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl bg-card text-card-foreground">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Link href="/" className="flex items-center space-x-2 text-foreground">
                        <EducationalNotesLogo className="h-8 w-8 text-primary" />
                    </Link>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                <CardDescription className="text-muted-foreground">Enter your details below to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <SignUpForm />
            </CardContent>
            <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Sign in
                </Link>
                </p>
            </CardFooter>
            </Card>
        </main>
    </div>
  );
}
