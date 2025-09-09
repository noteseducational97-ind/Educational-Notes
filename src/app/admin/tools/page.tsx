
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, PlusCircle, Edit, Trash2, Eye, EyeOff, FileQuestion, ClipboardEdit, BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { initialTools } from '@/lib/data';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export type Tool = {
    id: string;
    title: string;
    description: string;
    href: string;
    visibility: 'public' | 'private';
    isComingSoon: boolean;
};

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


export default function AdminToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTools = sessionStorage.getItem('managed-tools');
            if (storedTools) {
                setTools(JSON.parse(storedTools));
            } else {
                sessionStorage.setItem('managed-tools', JSON.stringify(initialTools));
                setTools(initialTools);
            }
            setLoading(false);
        }
    }, []);

    const updateTools = (updatedTools: Tool[]) => {
        setTools(updatedTools);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('managed-tools', JSON.stringify(updatedTools));
        }
    };

    const handleDelete = (toolId: string) => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            const updatedTools = tools.filter(t => t.id !== toolId);
            updateTools(updatedTools);
            toast({
                title: `"${tool.title}" Deleted`,
                description: `The tool has been removed.`,
                variant: 'destructive'
            });
        }
    };
    
    const getToolIcon = (id: string) => {
        switch(id) {
            case 'admission-form': return <ClipboardEdit className="h-6 w-6 text-primary" />;
            case 'test-generator': return <FileQuestion className="h-6 w-6 text-primary" />;
            case 'content-generator': return <BrainCircuit className="h-6 w-6 text-primary" />;
            default: return <Wrench className="h-6 w-6 text-primary" />;
        }
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tool Management</h1>
                    <p className="text-muted-foreground">Configure the tools available to users on the platform.</p>
                </div>
                 <Button asChild>
                    <Link href="/admin/tools/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Tool
                    </Link>
                </Button>
            </div>
             <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
             >
                {tools.map((tool) => (
                    <motion.div variants={itemVariants} key={tool.id}>
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    {getToolIcon(tool.id)}
                                    {tool.title}
                                </CardTitle>
                                <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={tool.visibility === 'public' ? 'secondary' : 'outline'}>
                                        {tool.visibility === 'public' ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
                                        {tool.visibility === 'public' ? 'Public' : 'Private'}
                                    </Badge>
                                    {tool.isComingSoon && <Badge variant="outline">Coming Soon</Badge>}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Link: <span className="font-mono text-xs">{tool.href}</span></p>
                                </div>
                            </CardContent>
                                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/tools/edit/${tool.id}`}>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Link>
                                </Button>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive-outline" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the tool "{tool.title}".
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(tool.id)}>
                                            Yes, delete
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
