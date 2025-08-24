
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';

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
    <div className="grid min-h-screen w-full lg:grid-cols-2">
        <div className="hidden lg:flex flex-col items-center justify-center bg-sky-200 dark:bg-sky-900/50 p-8 text-center">
            <Link href="/" className="flex items-center space-x-4">
                <EducationalNotesLogo className="h-16 w-16 text-primary" />
            </Link>
            <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">Educational Notes</h1>
            <p className="mt-2 text-lg text-slate-700 dark:text-slate-300">Your journey to knowledge starts here.</p>
        </div>
        <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6 lg:hidden">
                    <Link href="/" className="flex items-center space-x-2 text-foreground">
                        <EducationalNotesLogo className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">Educational Notes</span>
                    </Link>
                </div>
                <Card className="w-full shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back!</CardTitle>
                        <CardDescription>Sign in to your Educational Notes account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                    <CardFooter className="flex flex-col items-center space-y-2">
                        <p className="text-sm">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
