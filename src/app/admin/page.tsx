
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookCopy, ArrowRight, Book, FileText, Wrench, GraduationCap } from 'lucide-react';
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
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.displayName || 'Admin'}!</h1>
            <p className="text-muted-foreground">Here's a quick overview of your platform.</p>
        </div>
        
        <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md" /> : <div className="text-2xl font-bold">{stats.resourceCount}</div>}
                    <p className="text-xs text-muted-foreground">Uploaded study materials</p>
                </CardContent>
              </Card>
            </motion.div>
        </motion.div>

        <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump right into managing your platform's content and features.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
               <Button asChild variant="outline">
                  <Link href="/admin/uploaded-resources">
                    <BookCopy className="mr-2" /> Manage Resources
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/admission">
                    <FileText className="mr-2" /> Manage Batches
                  </Link>
                </Button>
                 <Button asChild variant="outline">
                  <Link href="/admin/tools">
                    <Wrench className="mr-2" /> Manage Tools
                  </Link>
                </Button>
                 <Button asChild variant="outline">
                  <Link href="/admin/teachers">
                    <GraduationCap className="mr-2" /> Manage Teachers
                  </Link>
                </Button>
            </CardContent>
          </Card>
        </motion.div>
    </>
  );
}
