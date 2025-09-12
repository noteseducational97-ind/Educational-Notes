
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Trash2, Edit, Calendar, GraduationCap } from 'lucide-react';
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
import { getTeachers } from '@/lib/firebase/teachers';
import type { Teacher } from '@/types';
import { deleteTeacherAction } from './actions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


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
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getTeachers()
          .then(setTeachers)
          .catch(err => {
              toast({
                  variant: 'destructive',
                  title: 'Error loading teachers',
                  description: err.message,
              });
          })
          .finally(() => setLoading(false));
    }, [toast]);
    
    const handleDelete = async (teacherId: string, teacherName: string) => {
        const result = await deleteTeacherAction(teacherId);
        if(result.success) {
            setTeachers(prev => prev.filter(t => t.id !== teacherId));
            toast({
                title: 'Teacher Removed',
                description: `"${teacherName}" has been removed.`,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Could not remove teacher.',
                variant: 'destructive',
            });
        }
    };
    
    if (loading) {
        return <LoadingSpinner />;
    }

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
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
            >
                {teachers.map((teacher) => (
                  <motion.div variants={itemVariants} key={teacher.id}>
                    <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-xl">
                        <CardHeader>
                            <div>
                                <CardTitle>{teacher.name}</CardTitle>
                                <CardDescription>{teacher.education}</CardDescription>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge variant="destructive">{teacher.subject}</Badge>
                                    <Badge variant="secondary">{teacher.className}</Badge>
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
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                                    <AlertDialogAction onClick={() => handleDelete(teacher.id, teacher.name)}>
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
