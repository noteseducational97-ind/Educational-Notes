
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction } from '@/lib/firebase/admin';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, BookCopy, Trash2, UserX, UserCheck, Edit } from 'lucide-react';
import Link from 'next/link';
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

type User = {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
    emailVerified: boolean;
    disabled: boolean;
    creationTime: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
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
  }, [user, authLoading, isAdmin, router, toast]);

  const fetchUsers = () => {
    setLoadingData(true);
    listAllUsers()
      .then(allUsers => {
        const adminEmail = 'noteseducational97@gmail.com';
        const filteredUsers = allUsers.filter(u => u.email !== adminEmail);
        setUsers(filteredUsers);
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
      fetchUsers(); // Refresh the list
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
      fetchUsers(); // Refresh the list
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (authLoading || !user || !isAdmin) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <div className="flex gap-2">
               <Button asChild>
                  <Link href="/admin/uploaded-resources">
                      <BookCopy />
                      Uploaded Resources
                  </Link>
              </Button>
              <Button asChild>
                  <Link href="/admin/add-resource">
                      <PlusCircle />
                      Add New Resource
                  </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> Registered Users</CardTitle>
              <CardDescription>View and manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner className="min-h-0" />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
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
                              <span className="font-medium">{u.displayName || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.disabled ? 'destructive' : 'secondary'}>
                              {u.disabled ? 'Disabled' : 'Active'}
                            </Badge>
                          </TableCell>
                           <TableCell className="flex justify-start gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleDisable(u.uid, u.disabled)}
                              disabled={isProcessing === u.uid}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {u.disabled ? 'Enable' : 'Disable'}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isProcessing === u.uid}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
