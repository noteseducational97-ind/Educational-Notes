
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { getUsers } from '../actions';
import type { User } from '@/types';

export default function JoinPage() {
  const { user: authUser, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!authUser || !isAdmin) {
        router.push('/');
      } else {
        getUsers()
          .then(data => {
            if (data.users) {
              setUsers(data.users);
            }
          })
          .finally(() => setLoadingData(false));
      }
    }
  }, [authUser, authLoading, isAdmin, router]);
  
  if (authLoading || !isAdmin) {
    return <LoadingSpinner />;
  }

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">List of all registered users on the platform.</p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> All Users</CardTitle>
                <CardDescription>
                A complete list of all users in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="flex justify-center items-center h-96">
                    <LoadingSpinner className="min-h-0" />
                </div>
                ) : users.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                {user.isAdmin ? (
                                    <Badge variant="destructive"><ShieldCheck className="mr-1 h-3 w-3"/>Admin</Badge>
                                ) : (
                                    <Badge variant="secondary">User</Badge>
                                )}
                                </TableCell>
                                <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                ) : (
                    <p className="text-center text-muted-foreground py-12">No users found.</p>
                )}
            </CardContent>
        </Card>
    </>
  );
}
