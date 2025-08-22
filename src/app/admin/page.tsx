
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listAllUsers } from '@/lib/firebase/admin';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, BookCopy } from 'lucide-react';
import Link from 'next/link';

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
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        listAllUsers()
          .then(setUsers)
          .finally(() => setLoadingData(false));
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

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-6">
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
