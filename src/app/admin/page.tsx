
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookCopy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAdminStats } from './actions';

type AdminStats = {
  userCount: number;
  resourceCount: number;
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({ userCount: 0, resourceCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    async function fetchStats() {
      if(isAdmin) {
        setLoadingStats(true);
        const fetchedStats = await getAdminStats();
        setStats(fetchedStats);
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [isAdmin]);

  if (authLoading || !isAdmin) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/40">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <h1 className="text-3xl font-bold text-foreground mb-6">Admin Dashboard</h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md" /> : <div className="text-2xl font-bold">{stats.userCount}</div>}
                    <p className="text-xs text-muted-foreground">Registered users on the platform</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                    <BookCopy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md" /> : <div className="text-2xl font-bold">{stats.resourceCount}</div>}
                    <p className="text-xs text-muted-foreground">Uploaded study materials</p>
                </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View, enable, disable, or delete user accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin/users">
                    Go to User Management <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manage Resources</CardTitle>
                <CardDescription>Add, edit, or remove study materials from the library.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin/uploaded-resources">
                    Go to Resource Management <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
