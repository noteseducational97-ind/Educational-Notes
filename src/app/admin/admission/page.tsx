
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText /> Admission Forms</CardTitle>
          <CardDescription>
            A list of all admission forms available on the public website.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Form Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {admissionForms.map((form) => (
                    <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.title}</TableCell>
                        <TableCell>{form.description}</TableCell>
                        <TableCell>
                        <Badge variant={form.status === 'Open' ? 'secondary' : 'outline'}>{form.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild disabled>
                            <Link href={`/admin/admission/edit/${form.id}`}>
                            <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
