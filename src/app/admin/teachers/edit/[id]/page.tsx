
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, Book, Briefcase, FileText, GraduationCap, Loader2, Calendar, Phone, School, Mail, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Teacher } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getTeacherById } from '@/lib/firebase/teachers';
import { updateTeacherAction } from '../../actions';

export default function EditTeacherPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const teacherId = params.id as string;

    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacherId) return;
        
        getTeacherById(teacherId).then(fetchedTeacher => {
            if(fetchedTeacher) {
                setTeacher(fetchedTeacher);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Teacher not found',
                });
                router.push('/admin/teachers');
            }
        }).finally(() => setLoading(false));

    }, [teacherId, router, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if(teacher) {
            setTeacher(prev => ({ ...prev!, [id]: value }));
        }
    };

    useEffect(() => {
      if (!teacher || !teacher.since) return;
      const currentYear = new Date().getFullYear();
      const sinceYear = parseInt(teacher.since, 10);
      
      if (!isNaN(sinceYear) && sinceYear > 1900 && sinceYear <= currentYear) {
          const calculatedExperience = currentYear - sinceYear;
          setTeacher(prev => ({ ...prev!, experience: `${calculatedExperience}+ years` }));
      }
    }, [teacher?.since]);

    const handleSave = async () => {
        if (!teacher) return;
        setIsSubmitting(true);
        const { id, ...teacherData } = teacher;
        const result = await updateTeacherAction(id, teacherData);
        
        if(result.success) {
            toast({
                title: 'Teacher Updated!',
                description: `"${teacher.name}" has been updated.`,
            });
            router.push('/admin/teachers');
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error || 'Could not update the teacher.',
            });
        }
        setIsSubmitting(false);
    };
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!teacher) {
        return (
            <div className="text-center py-12">
                <p>Teacher not found.</p>
                <Button variant="link" asChild><Link href="/admin/teachers">Go Back</Link></Button>
            </div>
        );
    }


    return (
        <>
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Edit Teacher</CardTitle>
                    <CardDescription>Update details for {teacher.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2"><User /> Name</Label>
                            <Input id="name" placeholder="e.g., Rahul Patil" value={teacher.name || ''} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="education" className="flex items-center gap-2"><GraduationCap /> Education</Label>
                            <Input id="education" placeholder="e.g., M.Sc., B.Ed." value={teacher.education || ''} onChange={handleChange} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="photoUrl" className="flex items-center gap-2"><ImageIcon /> Photo URL</Label>
                        <Input id="photoUrl" placeholder="https://example.com/teacher.jpg" value={teacher.photoUrl || ''} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="className" className="flex items-center gap-2"><School /> Class Name</Label>
                        <Input id="className" placeholder="e.g., Shree Coaching Classes" value={teacher.className || ''} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="flex items-center gap-2"><Book /> Subject</Label>
                            <Input id="subject" placeholder="e.g., Biology" value={teacher.subject || ''} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail /> Email</Label>
                            <Input id="email" type="email" placeholder="e.g., teacher@example.com" value={teacher.email || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="since" className="flex items-center gap-2"><Calendar /> Since (Year)</Label>
                            <Input id="since" placeholder="e.g., 2010" value={teacher.since || ''} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase /> Experience</Label>
                            <Input id="experience" placeholder="e.g., 10+ years" value={teacher.experience || ''} onChange={handleChange} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="mobile" className="flex items-center gap-2"><Phone /> Mobile No.</Label>
                       <Input id="mobile" placeholder="e.g., 9876543210" value={teacher.mobile || ''} onChange={handleChange} />
                   </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 border-t pt-6">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/teachers"><ArrowLeft /> Back</Link>
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
