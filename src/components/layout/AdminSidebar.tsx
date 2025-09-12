
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Download, Bookmark, Menu, LogIn, UserPlus, LayoutDashboard, Users, BookCopy, FileText, Wrench, GraduationCap, ArrowLeft, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EducationalNotesLogo } from '../icons/EducationalNotesLogo';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/downloads', label: 'Download', icon: Download },
  { href: '/admin/uploaded-resources', label: 'Manage Resources', icon: BookCopy },
  { href: '/admin/admission', label: 'Batches', icon: FileText },
  { href: '/admin/tools', label: 'Manage Tools', icon: Wrench },
  { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
];

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode, isActive: boolean }) => (
    <Link
        href={href}
        prefetch={true}
        className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            isActive && 'bg-muted text-primary'
        )}
    >
        {children}
    </Link>
);

const MobileNavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode, isActive: boolean }) => (
    <SheetClose asChild>
        <Link
            href={href}
            prefetch={true}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
            )}
        >
            {children}
        </Link>
    </SheetClose>
);

const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: error.message,
      });
    }
  };

  const LinkComponent = isMobile ? MobileNavLink : NavLink;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto py-4">
          <nav className={cn("px-4 space-y-2", isMobile && "grid")}>
          {adminNavLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin' && href !== '/downloads' && pathname.startsWith(href));
              return (
                <LinkComponent href={href} isActive={isActive} key={label}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </LinkComponent>
              );
          })}
          </nav>
      </div>
      <div className='p-4 border-t space-y-2' style={{ marginBottom: '15px' }}>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                  <ArrowLeft />
                  Back to Home
              </Link>
          </Button>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-outline" className="w-full">
                    <LogOut />
                    Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                      You will be returned to the home page.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>
                      Yes, log out
                  </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </div>
    </div>
  );
};


export default function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border/40">
        <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Shield className="h-6 w-6 text-primary" />
                <span>Admin Panel</span>
            </Link>
        </div>
        <NavContent />
      </aside>
    </>
  );
}

export function MobileAdminSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Admin Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 w-64">
        <SheetHeader className="border-b p-4">
           <SheetTitle asChild>
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Shield className="h-6 w-6 text-primary" />
                    <span>Admin Panel</span>
                </Link>
           </SheetTitle>
        </SheetHeader>
        <NavContent isMobile={true} />
      </SheetContent>
    </Sheet>
  )
}
