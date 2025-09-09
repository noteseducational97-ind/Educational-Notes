
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction } from '../../actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit, CheckCircle, ArrowLeft, Ban, Check, ShieldAlert } from 'lucide-react';
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

export default function UserListPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const userType = params.userType as 'admins' | 'regular';

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
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

  if (authLoading || !user || !isAdmin || loadingData) {
    return <LoadingSpinner />;
  }

  const pageTitle = userType === 'admins' ? 'Admin Accounts' : 'Registered Users';
  const pageDescription = userType === 'admins' ? 'Users with administrative privileges.' : 'Standard users with no admin rights.';
  const areAllSelected = selectedUsers.length > 0 && selectedUsers.length === users.length;
  const isAnySelected = selectedUsers.length > 0;
  
  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            {isAnySelected && (
                 <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => handleBulkToggleDisable(true)} disabled={isProcessing}>
                       <Ban /> Disable
                    </Button>
                     <Button variant="outline" onClick={() => handleBulkToggleDisable(false)} disabled={isProcessing}>
                       <Check /> Enable
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="destructive" disabled={isProcessing}>
                              <Trash2 /> Delete
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
                 </div>
            )}
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
                      <TableHead padding="checkbox">
                         <Checkbox
                            checked={areAllSelected}
                            onCheckedChange={(checked) => handleToggleAll(Boolean(checked))}
                            aria-label="Select all"
                          />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow 
                        key={u.uid} 
                        data-state={selectedUsers.find(su => su.uid === u.uid) ? "selected" : ""}
                      >
                        <TableCell padding="checkbox">
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
                        <TableCell>{u.creationTime}</TableCell>
                        <TableCell>
                           <Badge variant={u.disabled ? 'destructive' : 'secondary'} className={!u.disabled ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700/50" : ""}>
                            {u.disabled ? 'Disabled' : 'Active'}
                          </Badge>
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
