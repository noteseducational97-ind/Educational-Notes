
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction, updateUserAdminStatus } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit, CheckCircle, ArrowLeft, Ban, Check, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function AdminUsersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(() => {
    setLoadingData(true);
    listAllUsers()
      .then(allUsers => {
        setUsers(allUsers);
      })
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading, isAdmin, router, fetchUsers]);

  const handleToggleSelection = (user: User) => {
    setSelectedUsers(prev =>
      prev.find(u => u.uid === user.uid)
        ? prev.filter(u => u.uid !== user.uid)
        : [...prev, user]
    );
  };
  
  const handleToggleAll = (checked: boolean) => {
      setSelectedUsers(checked ? users : []);
  };

  const handleBulkToggleDisable = async (disable: boolean) => {
    setIsProcessing(true);
    try {
      await Promise.all(
          selectedUsers.map(u => updateUserDisabledStatus(u.uid, disable))
      );
      toast({
        title: 'Success',
        description: `${selectedUsers.length} user(s) have been ${disable ? 'disabled' : 'enabled'}.`,
      });
      fetchUsers();
      setSelectedUsers([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedUsers.map(u => deleteUserAction(u.uid))
      );
      toast({
        title: 'Success',
        description: `${selectedUsers.length} user(s) have been permanently deleted.`,
      });
      fetchUsers();
      setSelectedUsers([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  }
  
  const handleBulkToggleAdmin = async (makeAdmin: boolean) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedUsers.map(u => updateUserAdminStatus(u.uid, makeAdmin))
      );
      toast({
        title: 'Success',
        description: `${selectedUsers.length} user(s) have their admin status updated.`,
      });
      fetchUsers();
      setSelectedUsers([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating admin status',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !user || !isAdmin) {
    return <LoadingSpinner />;
  }

  const areAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isAnySelected = selectedUsers.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">A complete list of all {users.length} users on the platform.</p>
        </div>
        <motion.div 
            className="flex flex-wrap gap-2 w-full sm:w-auto justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Button variant="outline" onClick={() => handleBulkToggleAdmin(true)} disabled={isProcessing || !isAnySelected}>
              <ShieldCheck className="h-4 w-4" /> <span className="sm:hidden lg:inline-block ml-2">Make Admin</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkToggleAdmin(false)} disabled={isProcessing || !isAnySelected}>
              <ShieldAlert className="h-4 w-4" /> <span className="sm:hidden lg:inline-block ml-2">Remove Admin</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkToggleDisable(true)} disabled={isProcessing || !isAnySelected}>
              <Ban className="h-4 w-4" /> <span className="sm:hidden lg:inline-block ml-2">Disable</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkToggleDisable(false)} disabled={isProcessing || !isAnySelected}>
              <Check className="h-4 w-4" /> <span className="sm:hidden lg:inline-block ml-2">Enable</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isProcessing || !isAnySelected}>
                  <Trash2 className="h-4 w-4" /> <span className="sm:hidden lg:inline-block ml-2">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the selected {selectedUsers.length} user(s). This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Yes, delete user(s)
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-0">
            {loadingData ? (
                <div className="flex justify-center items-center h-96">
                    <LoadingSpinner className="min-h-0" />
                </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">
                        <Checkbox
                          checked={areAllSelected}
                          onCheckedChange={(checked) => handleToggleAll(Boolean(checked))}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow 
                        key={u.uid} 
                        data-state={selectedUsers.find(su => su.uid === u.uid) ? "selected" : ""}
                      >
                        <TableCell className="px-4">
                          <Checkbox
                            checked={!!selectedUsers.find(su => su.uid === u.uid)}
                            onCheckedChange={() => handleToggleSelection(u)}
                            aria-label={`Select user ${u.displayName}`}
                          />
                        </TableCell>
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
                         <TableCell>
                            <Badge variant={u.isAdmin ? 'default' : 'secondary'} className="capitalize">
                                {u.isAdmin ? <ShieldCheck className="mr-1 h-3 w-3"/> : <Users className="mr-1 h-3 w-3"/>}
                                {u.isAdmin ? 'Admin' : 'User'}
                            </Badge>
                         </TableCell>
                        <TableCell>
                          <Badge variant={u.disabled ? 'destructive' : 'secondary'} className={!u.disabled ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700/50" : ""}>
                            {u.disabled ? <Ban className="mr-1 h-3 w-3"/> : <CheckCircle className="mr-1 h-3 w-3"/>}
                            {u.disabled ? 'Disabled' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.creationTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No users found on the platform.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
