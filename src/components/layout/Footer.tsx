
'use client';

import Link from 'next/link';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-8 sm:flex-row">
        <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <EducationalNotesLogo className="h-6 w-6 text-primary" />
            <span>Educational Notes</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Empowering students with free, high-quality educational resources.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-primary">
            About
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-primary">
            Privacy
          </Link>
        </div>
      </div>
      <div className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Educational Notes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
