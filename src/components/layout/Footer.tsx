import Link from 'next/link';
import { Building } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:px-6 sm:flex-row">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold">Educational Notes</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm">
          <Link href="/terms" className="text-muted-foreground transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
            Privacy Policy
          </Link>
        </div>
        <p className="text-sm text-muted-foreground text-center sm:text-right">&copy; {new Date().getFullYear()} Educational Notes. All rights reserved.</p>
      </div>
    </footer>
  );
}
