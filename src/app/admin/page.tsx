
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
import { CheckCircle, PlusCircle, XCircle, Users, BookCopy, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getResources, Resource } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { deleteResourceAction } from './actions';
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        Promise.all([listAllUsers(), getResources()])
          .then(([userResults, resourceResults]) => {
            setUsers(userResults);
            setResources(resourceResults);
          })
          .finally(() => setLoadingData(false));
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const handleDelete = async (id: string, title: string) => {
    setDeletingId(id);
    const result = await deleteResourceAction(id);
    if (result.success) {
      setResources(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Resource Deleted',
        description: `"${title}" has been successfully deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Deleting Resource',
        description: result.error,
      });
    }
    setDeletingId(null);
  };
  
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
            <Button asChild>
                <Link href="/admin/add-resource">
                    <PlusCircle />
                    Add New Resource
                </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookCopy /> Resources</CardTitle>
                  <CardDescription>Manage all study materials.</CardDescription>
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
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map((resource) => (
                            <TableRow key={resource.id}>
                              <TableCell className="font-medium">{resource.title}</TableCell>
                              <TableCell><Badge variant="secondary">{resource.category}</Badge></TableCell>
                              <TableCell>{resource.class.replace('class', 'Class ')}</TableCell>
                              <TableCell className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/edit-resource/${resource.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={deletingId === resource.id}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the resource "{resource.title}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(resource.id, resource.title)}>
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
      </main>
    </div>
  );
}
