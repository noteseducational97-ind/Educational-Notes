
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookCopy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAdminStats } from './actions';
import { motion } from 'framer-motion';

type AdminStats = {
  userCount: number;
  resourceCount: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      duration: 0.3
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3
    },
  },
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({ userCount: 0, resourceCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login');
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

  if (authLoading || !user || !isAdmin) {
    return <LoadingSpinner />;
  }

  return (
    <>
        <h1 className="text-3xl font-bold text-foreground mb-6">Admin Dashboard</h1>
        
        <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <motion.div variants={itemVariants}>
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
            </motion.div>
            <motion.div variants={itemVariants}>
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
            </motion.div>
        </motion.div>

        <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={itemVariants}>
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
          </motion.div>
          <motion.div variants={itemVariants}>
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
          </motion.div>
        </motion.div>
    </>
  );
}
