'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';
import Image from 'next/image';

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
        <div className="hidden lg:relative lg:flex">
            <Image 
                src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Library"
                fill
                className="object-cover"
                data-ai-hint="library books"
            />
            <div className="absolute inset-0 bg-primary/30 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center text-white">
                <Link href="/" className="flex items-center space-x-4 bg-black/50 p-4 rounded-xl">
                    <EducationalNotesLogo className="h-16 w-16" />
                </Link>
                <h1 className="mt-4 text-4xl font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">Educational Notes</h1>
                <p className="mt-2 text-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">Your journey to knowledge starts here.</p>
            </div>
        </div>
        <div className="flex items-center justify-center p-6 bg-background">
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
