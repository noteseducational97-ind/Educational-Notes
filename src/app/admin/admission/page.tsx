
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText } from 'lucide-react';
import Link from 'next/link';
import { getAdmissionForms, seedAdmissionForms } from '@/lib/firebase/admissions';
import type { AdmissionForm } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function AdminAdmissionPage() {
  const [forms, setForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedForms = await getAdmissionForms();
        if (fetchedForms.length === 0) {
          await seedAdmissionForms();
          fetchedForms = await getAdmissionForms();
          toast({
            title: 'Database Seeded',
            description: 'Initial admission forms have been added.',
          });
        }
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
      </div>
      {forms.length === 0 ? (
        <p>No admission forms found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.map((form) => (
                <Card key={form.id} className="flex flex-col justify-between bg-secondary/30 p-6">
                    <div>
                        <CardTitle className="text-2xl">{form.title}</CardTitle>
                        <CardDescription className="mt-2">{form.description}</CardDescription>
                    </div>
                     <div className="flex justify-between items-center mt-6">
                         <Badge variant={form.status === 'Open' ? 'secondary' : 'outline'}>{form.status}</Badge>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/admission/edit/${form.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Link>
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </>
  );
}
