
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Trash2, Edit, Calendar } from 'lucide-react';
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
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export type Teacher = {
  id: string;
  name: string;
  education: string;
  subject: string;
  experience: string;
  since: string;
  description: string;
};

const initialTeachers: Teacher[] = [
  {
    id: 'pravin-khachane',
    name: 'Pravin Khachane',
    education: 'M.Sc., B.Ed.',
    subject: 'Physics',
    experience: '30+ years',
    since: '1994',
    description: 'With over 30 years of teaching experience, Pravin Sir is a visionary in science education. His ability to simplify complex physics concepts has made him a beloved mentor.',
  },
  {
    id: 'mangesh-shete',
    name: 'Mangesh Shete',
    education: 'M.Sc., B.Ed.',
    subject: 'Chemistry',
    experience: '30+ years',
    since: '1994',
    description: 'A master of chemistry, Mangesh Sir has spent three decades nurturing curiosity and confidence. His empathetic approach continues to inspire thousands.',
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTeachers = sessionStorage.getItem('managed-teachers');
            if (storedTeachers) {
                setTeachers(JSON.parse(storedTeachers));
            } else {
                sessionStorage.setItem('managed-teachers', JSON.stringify(initialTeachers));
                setTeachers(initialTeachers);
            }
        }
    }, []);

    const updateTeachers = (updatedTeachers: Teacher[]) => {
        setTeachers(updatedTeachers);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('managed-teachers', JSON.stringify(updatedTeachers));
        }
    };
    
    const handleDelete = (teacherId: string) => {
        const teacher = teachers.find(t => t.id === teacherId);
        if(teacher) {
            const updatedTeachers = teachers.filter(t => t.id !== teacherId);
            updateTeachers(updatedTeachers);
            toast({
                title: 'Teacher Removed',
                description: `"${teacher.name}" has been removed.`,
                variant: 'destructive',
            });
        }
    };
    
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
                    <p className="text-muted-foreground">Oversee all educators on the platform.</p>
                </div>
                 <Button asChild>
                    <Link href="/admin/teachers/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Teacher
                    </Link>
                </Button>
            </div>
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
                {teachers.map((teacher) => (
                  <motion.div variants={itemVariants} key={teacher.id}>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <div>
                                <CardTitle>{teacher.name}</CardTitle>
                                <CardDescription>{teacher.education}</CardDescription>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary">{teacher.subject}</Badge>
                                    <Badge variant="outline">{teacher.experience}</Badge>
                                    <Badge variant="outline" className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Since {teacher.since}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{teacher.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t pt-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/teachers/edit/${teacher.id}`}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive-outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will remove "{teacher.name}" from the list.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(teacher.id)}>
                                        Yes, remove
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                    </motion.div>
                ))}
            </motion.div>
        </>
    );
}
