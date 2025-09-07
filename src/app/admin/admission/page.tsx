'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText, PlusCircle, Trash2, Book } from 'lucide-react';
import Link from 'next/link';
import { getAdmissionForms } from '@/lib/firebase/admissions';
import type { AdmissionForm } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { deleteAdmissionFormAction } from './actions';
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


export default function AdminAdmissionPage() {
  const [forms, setForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedForms = await getAdmissionForms();
        setForms(fetchedForms);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load admission forms.',
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleDelete = async (id: string, title: string) => {
    setDeletingId(id);
    const result = await deleteAdmissionFormAction(id);
    if (result.success) {
      setForms(prev => prev.filter(f => f.id !== id));
      toast({
        title: 'Batch Deleted',
        description: `"${title}" has been successfully deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Deleting Batch',
        description: result.error,
      });
    }
    setDeletingId(null);
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admission Management</h1>
          <p className="text-muted-foreground">Oversee all active and pending admission forms.</p>
        </div>
         <Button asChild>
            <Link href="/admin/admission/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Form
            </Link>
        </Button>
      </div>
      {forms.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No admission forms have been created yet.</p>
          <Button asChild variant="link">
             <Link href="/admin/admission/add">
                Create the first one
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
            {forms.map((form) => (
                <Card key={form.id} className="flex flex-col justify-between bg-secondary/30 p-6">
                    <div>
                        <CardTitle className="text-2xl">{form.title} <span className="text-base text-muted-foreground">({form.year})</span></CardTitle>
                        <p className="text-sm text-primary font-semibold mt-1">{form.className}</p>
                        <CardDescription className="mt-2">{form.description}</CardDescription>
                    </div>
                     <div className="flex justify-between items-center mt-6">
                         <Badge variant="secondary"><Book className="h-3 w-3 mr-1" />{form.subject}</Badge>
                         <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/admission/edit/${form.id}`}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={deletingId === form.id}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the admission form "{form.title}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(form.id, form.title)}>
                                        Yes, delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </>
  );
}
