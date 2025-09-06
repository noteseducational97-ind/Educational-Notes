
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Download, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/downloads', label: 'Downloads', icon: Download },
  { href: '/save', label: 'Watchlist', icon: Bookmark },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = (pathname === '/' && href === '/') || (pathname.startsWith(href) && href !== '/');
          return (
            <Link
              key={label}
              href={href}
              prefetch={true}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
