
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookCopy, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getResources, Resource } from '@/lib/firebase/resources';
import { deleteResourceAction } from '../actions';
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

export default function UploadedResourcesPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        getResources()
          .then(setResources)
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
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-foreground">Uploaded Resources</h1>
                    <p className="text-muted-foreground">Manage all your published study materials.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin">
                            <ArrowLeft />
                            Back to Dashboard
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
                  <CardTitle className="flex items-center gap-2"><BookCopy /> All Resources</CardTitle>
                  <CardDescription>View, edit, or delete any published resource.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                     <div className="flex justify-center items-center h-96">
                        <LoadingSpinner className="min-h-0" />
                    </div>
                  ) : resources.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Class</TableHead>
                             <TableHead>Subject</TableHead>
                            <TableHead>Stream</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map((resource) => (
                            <TableRow key={resource.id}>
                              <TableCell className="font-medium">{resource.title}</TableCell>
                              <TableCell><Badge variant="secondary">{resource.category}</Badge></TableCell>
                              <TableCell>{resource.class.replace('class', 'Class ')}</TableCell>
                               <TableCell><Badge variant="outline">{resource.subject}</Badge></TableCell>
                              <TableCell>{resource.stream}</TableCell>
                              <TableCell className="flex justify-end gap-2">
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
                  ) : (
                     <p className="text-center text-muted-foreground py-12">No resources have been uploaded yet.</p>
                  )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

