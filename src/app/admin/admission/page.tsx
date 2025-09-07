
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const admissionForms = [
    {
        title: 'Class 11 Physics',
        description: 'Admission for Class 11 Physics. Science Student',
        status: 'Open',
        id: 'class-11-physics'
    },
    {
        title: 'Class 12 Physics',
        description: 'Admission for Class 12 Physics. Science Student',
        status: 'Open',
        id: 'class-12-physics'
    },
    {
        title: 'Class 11 Chemistry',
        description: 'Admission for Class 11 Chemistry. Science Student',
        status: 'Open',
        id: 'class-11-chemistry'
    },
    {
        title: 'Class 12 Chemistry',
        description: 'Admission for Class 12 Chemistry. Science Student',
        status: 'Open',
        id: 'class-12-chemistry'
    },
    {
        title: 'MHT-CET',
        description: 'Admissions Form for MHT-CET Maharashtra',
        status: 'Open',
        id: 'mht-cet'
    }
];

export default function AdminAdmissionPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admission Management</h1>
          <p className="text-muted-foreground">Oversee all active and pending admission forms.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {admissionForms.map((form) => (
            <Card key={form.id} className="flex flex-col justify-between bg-secondary/30 p-6">
                <div>
                    <CardTitle className="text-2xl">{form.title}</CardTitle>
                    <CardDescription className="mt-2">{form.description}</CardDescription>
                </div>
                 <div className="flex justify-between items-center mt-6">
                     <Badge variant={form.status === 'Open' ? 'secondary' : 'outline'}>{form.status}</Badge>
                    <Button variant="outline" size="sm" asChild disabled>
                        <Link href={`/admin/admission/edit/${form.id}`}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Link>
                    </Button>
                </div>
            </Card>
        ))}
      </div>
    </>
  );
}
