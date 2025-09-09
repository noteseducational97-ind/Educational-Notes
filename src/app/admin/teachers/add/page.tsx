
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, User, Book, Briefcase, FileText, GraduationCap, Calendar, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { Teacher } from '../page';

const createSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const generateDescription = (name: string, subject: string, experience: string): string => {
    if (!name || !subject || !experience) return '';
    const experienceYears = experience.match(/\d+/)?.[0] || 'many';
    return `With over ${experienceYears} years of teaching experience, ${name} is a visionary in ${subject.toLowerCase()} education. Their ability to simplify complex concepts has made them a beloved mentor.`;
};


export default function AddTeacherPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacher, setTeacher] = useState<Partial<Teacher>>({
    name: '',
    education: '',
    subject: '',
    mobile: '',
    experience: '',
    since: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTeacher(prev => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (teacher.since) {
        const sinceYear = parseInt(teacher.since, 10);
        if (!isNaN(sinceYear) && sinceYear > 1900 && sinceYear <= currentYear) {
            const calculatedExperience = currentYear - sinceYear;
            setTeacher(prev => ({ ...prev, experience: `${calculatedExperience}+ years` }));
        }
    }
  }, [teacher.since]);
  
  useEffect(() => {
      if (teacher.name && teacher.subject && teacher.experience) {
        const newDescription = generateDescription(teacher.name, teacher.subject, teacher.experience);
        if (newDescription) {
            setTeacher(prev => ({ ...prev, description: newDescription }));
        }
      }
  }, [teacher.name, teacher.subject, teacher.experience]);
  
  const handleSave = () => {
    if (!teacher.name || !teacher.education || !teacher.subject || !teacher.experience || !teacher.description || !teacher.since) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out all required fields.',
        });
        return;
    }

    setIsSubmitting(true);
    try {
        const storedTeachersJSON = sessionStorage.getItem('managed-teachers');
        const storedTeachers = storedTeachersJSON ? JSON.parse(storedTeachersJSON) : [];
        
        const newTeacher: Teacher = {
            id: createSlug(teacher.name),
            ...teacher,
        } as Teacher;

        const updatedTeachers = [...storedTeachers, newTeacher];
        sessionStorage.setItem('managed-teachers', JSON.stringify(updatedTeachers));

        toast({
            title: 'Teacher Added!',
            description: `"${teacher.name}" has been added to the list.`,
        });
        router.push('/admin/teachers');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save the new teacher.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Add New Teacher</CardTitle>
              <CardDescription>Fill in the details below to add a new educator.</CardDescription>
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="flex items-center gap-2"><Book /> Subject</Label>
                        <Input id="subject" placeholder="e.g., Biology" value={teacher.subject} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="flex items-center gap-2"><Phone /> Mobile No.</Label>
                        <Input id="mobile" placeholder="e.g., 9876543210" value={teacher.mobile} onChange={handleChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="since" className="flex items-center gap-2"><Calendar /> Since (Year)</Label>
                        <Input id="since" placeholder="e.g., 2010" value={teacher.since} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase /> Experience</Label>
                        <Input id="experience" placeholder="e.g., 10+ years" value={teacher.experience} onChange={handleChange} disabled />
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
                    Save Teacher
                </Button>
            </CardFooter>
        </Card>
    </>
  );
}
