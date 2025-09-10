
'use client';

import { MobileAdminSidebar } from './AdminSidebar';
import UserNav from './UserNav';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { EducationalNotesLogo } from '../icons/EducationalNotesLogo';

export default function AdminHeader() {
  const { loading } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
      <MobileAdminSidebar />
      <div className="flex-1 text-center">
        <Link href="/admin" className="inline-flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg">Admin Panel</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserNav />}
      </div>
    </header>
  );
}

    