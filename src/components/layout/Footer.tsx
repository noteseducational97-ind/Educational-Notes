
import Link from 'next/link';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:px-6 sm:flex-row">
        <Link href="/" className="flex items-center space-x-2">
          <EducationalNotesLogo className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">Educational Notes</span>
        </Link>
        <p className="text-sm text-muted-foreground text-center sm:text-left">&copy; {new Date().getFullYear()} Educational Notes. All rights reserved.</p>
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          <Link href="/terms" className="text-muted-foreground transition-colors hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
            Privacy
          </Link>
          <a href="mailto:noteseducational97@gmail.com" className="text-muted-foreground transition-colors hover:text-primary">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
