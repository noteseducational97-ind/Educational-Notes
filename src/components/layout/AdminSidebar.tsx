
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Download, Bookmark, Menu, LogIn, UserPlus, LayoutDashboard, Users, BookCopy, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EducationalNotesLogo } from '../icons/EducationalNotesLogo';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/downloads', label: 'Download', icon: Download },
  { href: '/admin/uploaded-resources', label: 'Manage Resources', icon: BookCopy },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border/40">
        <div className="flex items-center h-16 border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <EducationalNotesLogo className="h-6 w-6 text-primary" />
                <span>Educational Notes</span>
            </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
            {adminNavLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                return (
                <Link
                    key={label}
                    href={href}
                    prefetch={true}
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </Link>
                );
            })}
            </nav>
        </div>
    </aside>
  );
}
