
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers, updateUserDisabledStatus, deleteUser as deleteUserAction } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Edit, ShieldCheck, Calendar, CheckCircle } from 'lucide-react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
    .split(' ')
    .map((n) => n[0])
    .join('');
};

const UserCard = ({ user, isProcessing, onToggleDisable, onDeleteUser }: { user: User, isProcessing: string | null, onToggleDisable: (uid: string, isDisabled: boolean) => void, onDeleteUser: (uid: string) => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
        <Collapsible>
            <Card>
                <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                <AvatarFallback className="text-xl">{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.displayName || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {user.creationTime}</span>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            <span>Status: </span>
                             <Badge variant={user.disabled ? 'destructive' : 'secondary'}>
                                {user.disabled ? 'Disabled' : 'Active'}
                            </Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isProcessing === user.uid}>
                                <Edit className="h-4 w-4 mr-2" />
                                Status
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to {user.disabled ? 'enable' : 'disable'} the user {user.email}?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onToggleDisable(user.uid, user.disabled)}>
                                    Yes, {user.disabled ? 'Enable' : 'Disable'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isProcessing === user.uid}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account for {user.email}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteUser(user.uid)}>
                                    Yes, delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        </motion.div>
    );
};

const UserSection = ({ title, description, icon, users, ...props }: { title: string, description: string, icon: React.ReactNode, users: User[], isProcessing: string | null, onToggleDisable: (uid: string, isDisabled: boolean) => void, onDeleteUser: (uid: string) => void }) => {
    return (
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">{icon} {title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {users.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => <UserCard key={user.uid} user={user} {...props} />)}
                 </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No users in this category.</p>
                </div>
            )}
        </div>
    );
};

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

      <UserSection
        title="Admin Accounts"
        description="Users with administrative privileges."
        icon={<ShieldCheck />}
        users={adminUsers}
        isProcessing={isProcessing}
        onToggleDisable={handleToggleDisable}
        onDeleteUser={handleDeleteUser}
      />
      
      <UserSection
        title="Registered Users"
        description="Standard users with no admin rights."
        icon={<Users />}
        users={regularUsers}
        isProcessing={isProcessing}
        onToggleDisable={handleToggleDisable}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
