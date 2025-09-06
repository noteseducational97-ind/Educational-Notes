
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Download, Bookmark, Menu, LogIn, UserPlus, LayoutDashboard, Loader2, Wrench, Info } from 'lucide-react';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import React from 'react';
import { EducationalNotesLogo } from '../icons/EducationalNotesLogo';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/downloads', label: 'Downloads', icon: Download },
  { href: '/save', label: 'Watchlist', icon: Bookmark },
  { href: '/#tools', label: 'Tools', icon: Wrench },
  { href: '/about', label: 'About', icon: Info },
];


export default function Header() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'transition-colors hover:text-primary font-medium flex items-center gap-1.5',
        (pathname === href || (href !== '/' && !href.includes('#') && pathname.startsWith(href))) ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
     <SheetClose asChild>
      <Link
        href={href}
        prefetch={true}
        className={cn(
          'flex items-center gap-4 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          (pathname === href || (href !== '/' && !href.includes('#') && pathname.startsWith(href))) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )}
      >
        {children}
      </Link>
    </SheetClose>
  )

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <EducationalNotesLogo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-lg">Educational Notes</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm md:flex">
            {navLinks.map(({ href, label }) => (
                <NavLink key={label} href={href}>
                  {label}
                </NavLink>
              )
            )}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : user ? (
              <>
                <UserNav />
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn/>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    <UserPlus />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetClose asChild>
                            <Link
                                href="/"
                                className="mb-4 flex items-center gap-2 text-lg font-semibold"
                            >
                                <EducationalNotesLogo className="h-6 w-6 text-primary" />
                                <span>Educational Notes</span>
                            </Link>
                        </SheetClose>
                    </SheetHeader>
                  <nav className="grid gap-6 text-lg font-medium">
                     {navLinks.map(({ href, label, icon: Icon }) => (
                       <MobileNavLink key={label} href={href}>
                        <Icon className="h-5 w-5" />
                        {label}
                       </MobileNavLink>
                    ))}
                    {!user && (
                       <div className="border-t pt-6 mt-4 space-y-4">
                        <MobileNavLink href="/login">
                          <LogIn className="h-5 w-5" />
                          Sign In
                        </MobileNavLink>
                        <MobileNavLink href="/signup">
                          <UserPlus className="h-5 w-5" />
                          Sign Up
                        </MobileNavLink>
                      </div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
