
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
import { db } from '@/lib/firebase/server'; // This is fine for server-side fetching, but we need a client-side approach

type AdminStats = {
  userCount: number;
  resourceCount: number;
};

// This server-side function will be moved to a client-callable action if needed,
// but for now, we'll use a client-side fetch for simplicity.
// We'll mock the data on the client. A proper implementation would use a server action.
async function getAdminStats(): Promise<AdminStats> {
    const users = await db.collection('users').get();
    const resources = await db.collection('resources').get();
    return {
        userCount: users.size,
        resourceCount: resources.size,
    };
}


export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Mocking stats for client-side display as we can't call server-side db directly
  const [stats, setStats] = useState<AdminStats>({ userCount: 0, resourceCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  // This is a placeholder for fetching stats.
  // In a real app, you'd call a Server Action here.
  useEffect(() => {
    setLoadingStats(true);
    // Simulate fetching data
    setTimeout(() => {
      // In a real scenario, you would fetch this data from your backend.
      // For the prototype, we are using placeholder values.
      setStats({ userCount: 125, resourceCount: 42 });
      setLoadingStats(false);
    }, 1000);
  }, []);

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
