'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction } from '../../actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
    .split(' ')
    .map((n) => n[0])
    .join('');
};


export default function UserListPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const userType = params.userType as 'admins' | 'regular';

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const fetchUsers = () => {
    setLoadingData(true);
    listAllUsers()
      .then(allUsers => {
        if (userType === 'admins') {
            setUsers(allUsers.filter(u => u.isAdmin));
        } else {
            setUsers(allUsers.filter(u => !u.isAdmin));
        }
      })
      .finally(() => setLoadingData(false));
  };
  
  const handleToggleDisable = async (uid: string, isDisabled: boolean) => {
    setIsProcessing(uid);
    try {
      await updateUserDisabledStatus(uid, !isDisabled);
      toast({
        title: 'Success',
        description: `User has been ${!isDisabled ? 'disabled' : 'enabled'}.`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setIsProcessing(uid);
    try {
      await deleteUserAction(uid);
      toast({
        title: 'Success',
        description: 'User has been permanently deleted.',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  }

  if (authLoading || !user || !isAdmin || loadingData) {
    return <LoadingSpinner />;
  }

  const pageTitle = userType === 'admins' ? 'Admin Accounts' : 'Registered Users';
  const pageDescription = userType === 'admins' ? 'Users with administrative privileges.' : 'Standard users with no admin rights.';
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
      </div>

       {users.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={u.photoURL ?? ''} alt={u.displayName ?? 'User'} />
                              <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.displayName || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{u.creationTime}</TableCell>
                        <TableCell>
                          <Badge variant={u.disabled ? 'destructive' : 'secondary'}>
                            {u.disabled ? 'Disabled' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" disabled={isProcessing === u.uid}>
                                      <Edit className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to {u.disabled ? 'enable' : 'disable'} the user {u.email}?
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleToggleDisable(u.uid, u.disabled)}>
                                          Yes, {u.disabled ? 'Enable' : 'Disable'}
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon" disabled={isProcessing === u.uid || u.isAdmin}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the user account for {u.email}.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(u.uid)}>
                                          Yes, delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No users in this category.</p>
            </div>
        )}
    </div>
  );
}
