'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building, Home, BookText, Bookmark, Info, Shield } from 'lucide-react';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/resources', label: 'Resources', icon: BookText },
  { href: '/save', label: 'Save', icon: Bookmark },
  { href: '/about', label: 'About', icon: Info },
];

export default function Header() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold">Educational Notes</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
             <Link
              href="/admin"
              className={cn(
                'transition-colors hover:text-primary flex items-center',
                pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
