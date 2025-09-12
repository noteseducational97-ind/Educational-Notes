
'use client';
import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction, updateUserAdminStatus } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, CheckCircle, Ban, Check, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
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
  const { user: currentUser, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, startTransition] = useTransition();
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
      if (!currentUser || !isAdmin) {
        router.push('/admin/login');
      } else {
        fetchUsers();
      }
    }
  }, [currentUser, authLoading, isAdmin, router, fetchUsers]);

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

  const handleBulkAction = async (action: (uid: string, param?: any) => Promise<any>, successMessage: string, errorMessage: string, param?: any) => {
    startTransition(async () => {
        try {
            await Promise.all(selectedUsers.map(u => action(u.uid, param)));
            toast({ title: 'Success', description: `${selectedUsers.length} ${successMessage}` });
            fetchUsers();
            setSelectedUsers([]);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        }
    });
  };

  if (authLoading || !currentUser || !isAdmin) {
    return <LoadingSpinner />;
  }

  const areAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isAnySelected = selectedUsers.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">A complete list of all {users.length} user(s) on the platform.</p>
        </div>
        <motion.div 
            className="flex flex-wrap gap-2 w-full sm:w-auto justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Button variant="outline" onClick={() => handleBulkAction(updateUserAdminStatus, "user(s) made admin.", "Failed to update admin status.", true)} disabled={isProcessing || !isAnySelected}>
              <ShieldCheck /> <span className="sm:hidden lg:inline-block ml-2">Make Admin</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction(updateUserAdminStatus, "user(s) admin status removed.", "Failed to update admin status.", false)} disabled={isProcessing || !isAnySelected}>
              <ShieldAlert /> <span className="sm:hidden lg:inline-block ml-2">Remove Admin</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction(updateUserDisabledStatus, "user(s) disabled.", "Failed to disable users.", true)} disabled={isProcessing || !isAnySelected}>
              <Ban /> <span className="sm:hidden lg:inline-block ml-2">Disable</span>
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction(updateUserDisabledStatus, "user(s) enabled.", "Failed to enable users.", false)} disabled={isProcessing || !isAnySelected}>
              <Check /> <span className="sm:hidden lg:inline-block ml-2">Enable</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isProcessing || !isAnySelected}>
                  <Trash2 /> <span className="sm:hidden lg:inline-block ml-2">Delete</span>
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
                  <AlertDialogAction onClick={() => handleBulkAction(deleteUserAction, "user(s) deleted.", "Failed to delete users.")}>
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
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">No users found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">No users have registered on the platform yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
