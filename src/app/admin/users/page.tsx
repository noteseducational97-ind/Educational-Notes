'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
    .split(' ')
    .map((n) => n[0])
    .join('');
};

export default function AdminUsersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const fetchUsers = useCallback(async () => {
      setLoadingData(true);
      try {
          const allUsers = await listAllUsers();
          setUsers(allUsers);
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Error fetching users',
              description: 'Could not load user data. Please try again.',
          });
          console.error("Failed to fetch users:", error);
      } finally {
          setLoadingData(false);
      }
  }, [toast]);
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({ variant: 'destructive', title: 'Unauthorized Access', description: 'Please log in to view this page.' });
        router.push('/login');
      } else if (!isAdmin) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to access the admin panel.' });
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading, isAdmin, router, toast, fetchUsers]);

  const { adminUsers, regularUsers, owner } = useMemo(() => {
    const adminUsers = users.filter(u => u.isAdmin);
    const regularUsers = users.filter(u => !u.isAdmin);
    const owner = adminUsers.find(u => u.email === 'noteseducational97@gmail.com');
    return { adminUsers, regularUsers, owner };
  }, [users]);
  
  if (authLoading || !user || !isAdmin) {
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
              <CardTitle className="flex items-center gap-2"><Users /> Registered Users</CardTitle>
              <CardDescription>Standard users with no admin rights.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               {loadingData ? <div className="h-10 w-16 bg-muted animate-pulse rounded-md" /> : <p className="text-4xl font-bold">{regularUsers.length}</p>}
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
