
'use client';

import Link from 'next/link';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center space-x-2 text-foreground">
            <EducationalNotesLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Educational Notes</span>
          </Link>
        </div>
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription>No worries, we'll send you reset instructions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
          <CardFooter>
            <Button variant="link" asChild className="w-full">
              <Link href="/login">
                <ArrowLeft />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
