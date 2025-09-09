
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit, ShieldCheck } from 'lucide-react';
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
    isAdmin: boolean;
}

const UserTable = ({ users, title, description, isProcessing, onToggleDisable, onDeleteUser }: { users: User[], title: string, description: string, isProcessing: string | null, onToggleDisable: (uid: string, isDisabled: boolean) => void, onDeleteUser: (uid: string) => void }) => {
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name
        .split(' ')
        .map((n) => n[0])
        .join('');
    };

    return (
        <Card className="animate-fade-in-up">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                {title === 'Admin Accounts' ? <ShieldCheck /> : <Users />}
                {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
            {users.length > 0 ? (
                <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Creation Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
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
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>{u.creationTime}</TableCell>
                        <TableCell>
                            <Badge variant={u.disabled ? 'destructive' : 'secondary'}>
                            {u.disabled ? 'Disabled' : 'Active'}
                            </Badge>
                        </TableCell>
                            <TableCell className="flex justify-center gap-2">
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isProcessing === u.uid}>
                                <Edit className="h-4 w-4 mr-2" />
                                Status
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
                                <AlertDialogAction onClick={() => onToggleDisable(u.uid, u.disabled)}>
                                    Yes, {u.disabled ? 'Enable' : 'Disable'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
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
                                <AlertDialogAction onClick={() => onDeleteUser(u.uid)}>
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
            ) : (
                <p className="text-center text-muted-foreground py-12">No users in this category.</p>
            )}
            </CardContent>
        </Card>
    )
}

export default function AdminUsersPage() {
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
      .then(setUsers)
      .finally(() => setLoadingData(false));
  };
  
  const { adminUsers, regularUsers } = useMemo(() => {
    const adminUsers = users.filter(u => u.isAdmin);
    const regularUsers = users.filter(u => !u.isAdmin);
    return { adminUsers, regularUsers };
  }, [users]);
  
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


  if (authLoading || !user || !isAdmin || loadingData) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">View and manage all user accounts.</p>
      </div>

      <UserTable
        users={adminUsers}
        title="Admin Accounts"
        description="Users with administrative privileges."
        isProcessing={isProcessing}
        onToggleDisable={handleToggleDisable}
        onDeleteUser={handleDeleteUser}
      />
      
      <UserTable
        users={regularUsers}
        title="Registered Users"
        description="Standard users with no admin rights."
        isProcessing={isProcessing}
        onToggleDisable={handleToggleDisable}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
