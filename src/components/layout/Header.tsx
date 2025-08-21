'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building, Home, BookText, Bookmark, Info, Shield, Menu } from 'lucide-react';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import React from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/resources', label: 'Resources', icon: BookText },
  { href: '/save', label: 'Save', icon: Bookmark },
  { href: '/about', label: 'About', icon: Info },
];

export default function Header() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
     <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-4 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          pathname === href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )}
      >
        {children}
      </Link>
    </SheetClose>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">Educational Notes</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => (
            <NavLink key={label} href={href}>
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink href="/admin">
              <span className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </span>
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="mb-4 flex items-center gap-2 text-lg font-semibold"
                    >
                      <Building className="h-6 w-6 text-primary" />
                      <span>Educational Notes</span>
                    </Link>
                  </SheetClose>
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <MobileNavLink key={label} href={href}>
                      <Icon className="h-5 w-5" />
                      {label}
                    </MobileNavLink>
                  ))}
                  {isAdmin && (
                    <MobileNavLink href="/admin">
                      <Shield className="h-5 w-5" />
                      Admin
                    </MobileNavLink>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
