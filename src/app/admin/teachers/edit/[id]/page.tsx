
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, Book, Briefcase, FileText, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Teacher } from '../page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


export default function EditTeacherPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const teacherId = params.id;

    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacherId || typeof window === 'undefined') return;
        
        const storedTeachersJSON = sessionStorage.getItem('managed-teachers');
        if (storedTeachersJSON) {
            const storedTeachers: Teacher[] = JSON.parse(storedTeachersJSON);
            const foundTeacher = storedTeachers.find(t => t.id === teacherId);
            if(foundTeacher) {
                setTeacher(foundTeacher);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Teacher not found',
                });
                router.push('/admin/teachers');
            }
        }
        setLoading(false);
    }, [teacherId, router, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if(teacher) {
            setTeacher(prev => ({ ...prev!, [id]: value }));
        }
    };
  
    const handleSave = () => {
        if (!teacher) return;
        setIsSubmitting(true);
        try {
            const storedTeachersJSON = sessionStorage.getItem('managed-teachers');
            const storedTeachers: Teacher[] = storedTeachersJSON ? JSON.parse(storedTeachersJSON) : [];
            const updatedTeachers = storedTeachers.map(t => t.id === teacher.id ? teacher : t);
            sessionStorage.setItem('managed-teachers', JSON.stringify(updatedTeachers));

            toast({
                title: 'Teacher Updated!',
                description: `"${teacher.name}" has been updated.`,
            });
            router.push('/admin/teachers');
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update the teacher.',
            });
        } finally {
            setIsSubmitting(false);
        }
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
                            <Input id="name" placeholder="e.g., Jane Doe" value={teacher.name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="education" className="flex items-center gap-2"><GraduationCap /> Education</Label>
                            <Input id="education" placeholder="e.g., M.Sc., B.Ed." value={teacher.education} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="flex items-center gap-2"><Book /> Subject</Label>
                            <Input id="subject" placeholder="e.g., Biology" value={teacher.subject} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase /> Experience</Label>
                            <Input id="experience" placeholder="e.g., 10+ years" value={teacher.experience} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2"><FileText /> Description</Label>
                        <Textarea id="description" placeholder="Describe the teacher's approach, qualifications, etc..." value={teacher.description} onChange={handleChange} />
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
