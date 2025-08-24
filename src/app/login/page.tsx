
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="hidden bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 lg:flex flex-col items-center justify-center p-8 text-center">
        <Link href="/" className="flex items-center space-x-4">
            <EducationalNotesLogo className="h-16 w-16 text-primary" />
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-primary-foreground [text-shadow:_2px_2px_4px_rgb(0_0_0_/_20%)]">
            Welcome to Educational Notes
        </h1>
        <p className="mt-2 text-lg text-primary-foreground/80 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_20%)]">
            Your journey to knowledge starts here.
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
