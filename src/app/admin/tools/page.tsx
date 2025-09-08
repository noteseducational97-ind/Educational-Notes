
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

export type Tool = {
    id: string;
    title: string;
    description: string;
    href: string;
    visibility: 'public' | 'private';
    isComingSoon: boolean;
};

export const initialTools: Tool[] = [
    {
        id: 'admission-form',
        title: 'Admission Form',
        description: 'A tool for creating and studying with Admission Form.',
        href: '/admission',
        visibility: 'public',
        isComingSoon: false,
    }
];

export default function AdminToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        // This check ensures we only set the initial state once on the client-side.
        // In a real app, this would be where you fetch data from a database.
        if (typeof window !== 'undefined') {
            const storedTools = sessionStorage.getItem('managed-tools');
            if (storedTools) {
                setTools(JSON.parse(storedTools));
            } else {
                setTools(initialTools);
            }
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
    
    const ToolCard = ({ tool, index }: { tool: Tool, index: number }) => (
        <Card 
            className="flex flex-col animate-fade-in-up"
            style={{animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards'}}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench /> 
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
                        <Button variant="destructive-outline" size="sm">
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
    );


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
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, i) => (
                    <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
            </div>
        </>
    );
}
