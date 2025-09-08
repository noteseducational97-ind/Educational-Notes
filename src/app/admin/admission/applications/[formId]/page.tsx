
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdmissionFormById, getApplicationsForForm } from '@/lib/firebase/admissions';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function AdmissionApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
  
  const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [form, apps] = await Promise.all([
          getAdmissionFormById(formId),
          getApplicationsForForm(formId)
        ]);
        
        if (!form) {
          router.push('/admin/admission');
          return;
        }

        setFormDetails(form);
        setApplications(apps);
      } catch (error) {
        console.error("Failed to fetch admission data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, router]);

  const handleExportCSV = () => {
    if (!applications.length || !formDetails) return;

    const headers = [
      'Full Name', 'Student Phone', 'Parent Phone', 'Date of Birth', 
      'Category', 'Previous School', 'Board', 'Percentage', 'Payment Mode'
    ];
    
    const csvRows = [
      headers.join(','),
      ...applications.map(app => [
        `"${app.fullName}"`,
        `"${app.studentPhone}"`,
        `"${app.parentPhone}"`,
        `"${app.dateOfBirth}"`,
        `"${app.category}"`,
        `"${app.previousSchool}"`,
        `"${app.board}"`,
        `"${app.percentage}"`,
        `"${app.paymentMode}"`,
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const safeTitle = formDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `applications-${safeTitle}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications for {formDetails?.title}</h1>
          <p className="text-muted-foreground">List of all submitted applications for this batch.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleExportCSV} disabled={applications.length === 0} className="flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/admin/admission">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {applications.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Student Phone</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Previous School</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Payment Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{app.studentPhone}</TableCell>
                      <TableCell>{app.parentPhone}</TableCell>
                      <TableCell>{app.dateOfBirth}</TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell>{app.previousSchool}</TableCell>
                      <TableCell>{app.board}</TableCell>
                      <TableCell>{app.percentage}</TableCell>
                      <TableCell>{app.paymentMode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No applications have been submitted for this batch yet.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
