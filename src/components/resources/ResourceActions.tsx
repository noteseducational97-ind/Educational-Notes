
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, HelpCircle, LogIn, ExternalLink, FileQuestion } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Resource } from '@/types';
import Link from 'next/link';

type ResourceActionsProps = {
  resource: Resource;
  isTestable: boolean;
};

export default function ResourceActions({ resource, isTestable }: ResourceActionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isLinkDisabled = resource.isComingSoon || !resource.pdfUrl;

  const handleDownloadClick = () => {
    if (!user) {
      setShowLoginDialog(true);
    }
  };

  const getDownloadUrl = () => {
    return resource.isComingSoon ? '#' : resource.pdfUrl || '#';
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
            {user ? (
            <Button asChild disabled={isLinkDisabled} className="w-full">
                <Link href={getDownloadUrl()} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
                </Link>
            </Button>
            ) : (
            <Button onClick={handleDownloadClick} disabled={isLinkDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
            )}
             {isTestable && (
              <Button asChild variant="outline" className="w-full">
                <Link href={{
                  pathname: '/tools/test-generator',
                  query: { 
                    content: resource.content,
                    title: resource.title,
                    subject: resource.subject.join(', '),
                    class: resource.class || '',
                   }
                }}>
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Generate Test
                </Link>
              </Button>
            )}
        </div>
      </div>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to download PDF. Please sign in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
