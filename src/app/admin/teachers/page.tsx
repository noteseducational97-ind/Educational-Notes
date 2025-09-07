
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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

type Teacher = {
  id: string;
  name: string;
  subject: string;
  experience: string;
  avatarUrl?: string;
};

const initialTeachers: Teacher[] = [
  {
    id: 'pravin-khachane',
    name: 'Pravin Khachane (M.Sc., B.Ed.)',
    subject: 'Physics',
    experience: 'With over 30 years of teaching experience, Pravin Sir is a visionary in science education. His ability to simplify complex physics concepts has made him a beloved mentor.',
    avatarUrl: 'https://picsum.photos/id/1005/100/100'
  },
  {
    id: 'mangesh-shete',
    name: 'Mangesh Shete (M.Sc., B.Ed.)',
    subject: 'Chemistry',
    experience: 'A master of chemistry, Mangesh Sir has spent three decades nurturing curiosity and confidence. His empathetic approach continues to inspire thousands.',
    avatarUrl: 'https://picsum.photos/id/1012/100/100'
  }
];

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const { toast } = useToast();

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

    const handleDelete = (teacherId: string) => {
        const teacher = teachers.find(t => t.id === teacherId);
        if(teacher) {
            setTeachers(current => current.filter(t => t.id !== teacherId));
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
                 <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Teacher
                </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                {teachers.map(teacher => (
                    <Card key={teacher.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                                <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{teacher.name}</CardTitle>
                                <CardDescription>{teacher.subject}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{teacher.experience}</p>
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
                ))}
            </div>
        </>
    );
}
