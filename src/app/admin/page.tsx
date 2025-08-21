'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers } from '@/lib/firebase/admin';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, XCircle, Trash2 } from 'lucide-react';
import AddResourceDialog from '@/components/admin/AddResourceDialog';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        listAllUsers()
          .then(setUsers)
          .finally(() => setLoadingUsers(false));
      }
    }
  }, [user, authLoading, isAdmin, router]);

  if (authLoading || !isAdmin) {
    return <LoadingSpinner />;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const onResourceAdded = () => {
    // Here you could refresh the resources list if they were displayed on this page
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
            <Button onClick={() => setIsAddResourceOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
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
                        <TableHead>Email Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Created</TableHead>
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
                            {u.emailVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.disabled ? 'destructive' : 'secondary'}>
                              {u.disabled ? 'Disabled' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>{u.creationTime}</TableCell>
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
      <AddResourceDialog 
        isOpen={isAddResourceOpen}
        setIsOpen={setIsAddResourceOpen}
        onResourceAdded={onResourceAdded}
      />
    </div>
  );
}
