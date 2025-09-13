
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdmissionFormById, getApplicationsForForm } from '@/lib/firebase/admissions';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import PasswordPrompt from '@/components/auth/PasswordPrompt';
import { format } from 'date-fns';
import ApplicationDetailDialog from './ApplicationDetailDialog';
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
import { useToast } from '@/hooks/use-toast';
import { deleteApplicationAction } from '../../actions';

export default function AdmissionApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
  
  const [formDetails, setFormDetails] = useState<AdmissionForm | null>(null);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const apps = await getApplicationsForForm(formId);
      setApplications(apps);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load applications.',
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!formId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const form = await getAdmissionFormById(formId);
        
        if (!form) {
          router.push('/admin/admission');
          return;
        }

        setFormDetails(form);

        if (!form.isPasswordProtected) {
          setIsAuthenticated(true);
          await fetchApplications();
        } else {
            const storedPassword = sessionStorage.getItem(`admission-password-${formId}`);
            if (storedPassword === form.password) {
                setIsAuthenticated(true);
                await fetchApplications();
            }
        }
      } catch (error) {
        console.error("Failed to fetch admission data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, router]);
  
  const handleAuthSuccess = async () => {
      setIsAuthenticated(true);
      await fetchApplications();
  }
  
  const handleDelete = async (applicationId: string, studentName: string) => {
    if (!formId) return;
    setDeletingId(applicationId);
    const result = await deleteApplicationAction(formId, applicationId);
    if (result.success) {
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast({
        title: 'Application Deleted',
        description: `The application for "${studentName}" has been removed.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Deleting',
        description: result.error,
      });
    }
    setDeletingId(null);
  }

  const handleExportCSV = () => {
    if (!applications.length || !formDetails) return;

    const headers = [
      'Full Name', 'Student Phone', 'Parent Phone', 'Date of Birth', 
      'Category', 'Previous School', 'Board', 'Percentage', 
      'Payment Mode',
      'Extracted Sender', 'Extracted Amount', 'Extracted Date', 'Extracted Time', 'Transaction ID'
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
        `"${app.senderName || ''}"`,
        `"${app.paymentAmount || ''}"`,
        `"${app.transactionDate || ''}"`,
        `"${app.transactionTime || ''}"`,
        `"${app.transactionId || ''}"`,
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


  if (loading && !isAuthenticated) {
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
            <Button onClick={handleExportCSV} disabled={applications.length === 0 || !isAuthenticated} className="flex-1 sm:flex-none">
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

      {!isAuthenticated && formDetails && formId ? (
          <PasswordPrompt 
              formId={formId} 
              correctPassword={formDetails.password} 
              onSuccess={handleAuthSuccess} 
          />
      ) : (
        <Card>
          <CardContent>
            {loading ? <LoadingSpinner className="min-h-[400px]" /> : applications.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell onClick={() => setSelectedApplication(app)} className="font-medium cursor-pointer hover:underline">{app.fullName}</TableCell>
                        <TableCell onClick={() => setSelectedApplication(app)} className="cursor-pointer">{format(new Date(app.submittedAt), 'PPP')}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={`/admission/receipt/${formId}/${app.id}`} target="_blank">
                                    Download Receipt
                                </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive-outline" size="sm" disabled={deletingId === app.id}>
                                      <Trash2 className="h-4 w-4" /> Remove
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the application for "{app.fullName}".
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(app.id, app.fullName)}>
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
              <p className="text-center text-muted-foreground py-12">No applications have been submitted for this batch yet.</p>
            )}
          </CardContent>
        </Card>
      )}
       {selectedApplication && (
        <ApplicationDetailDialog
          application={selectedApplication}
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </>
  );
}
