
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

type User = {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
    emailVerified: boolean;
    disabled: boolean;
    creationTime: string;
    isAdmin: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AdminUsersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({ variant: 'destructive', title: 'Unauthorized Access', description: 'Please log in to view this page.' });
        router.push('/login');
      } else if (!isAdmin) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to access the admin panel.' });
        router.push('/');
      } else {
        setLoadingData(true);
        listAllUsers()
          .then(setUsers)
          .finally(() => setLoadingData(false));
      }
    }
  }, [user, authLoading, isAdmin, router, toast]);

  const { adminUsers, regularUsers } = useMemo(() => {
    const adminUsers = users.filter(u => u.isAdmin);
    const regularUsers = users.filter(u => !u.isAdmin);
    return { adminUsers, regularUsers };
  }, [users]);
  
  if (authLoading || !user || !isAdmin || loadingData) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">View and manage all user accounts.</p>
      </div>

      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck /> Admin Accounts</CardTitle>
              <CardDescription>Users with administrative privileges.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-4xl font-bold">{adminUsers.length}</p>
              <p className="text-sm text-muted-foreground">Total Admins</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/users/list/admins">
                    View Admins <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> Registered Users</CardTitle>
              <CardDescription>Standard users with no admin rights.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <p className="text-4xl font-bold">{regularUsers.length}</p>
               <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
            <CardFooter>
                <Button asChild>
                    <Link href="/admin/users/list/regular">
                        View Users <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
