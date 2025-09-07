
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, PlusCircle, Edit, Trash2, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useParams } from 'next/navigation';
import type { Tool } from '../page';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


const createSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export default function EditToolPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const toolId = params.id as string;
    
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!toolId || typeof window === 'undefined') return;

        const storedToolsJSON = sessionStorage.getItem('managed-tools');
        if (storedToolsJSON) {
            const storedTools: Tool[] = JSON.parse(storedToolsJSON);
            const foundTool = storedTools.find(t => t.id === toolId);
            if (foundTool) {
                setTool(foundTool);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Tool not found',
                });
                router.push('/admin/tools');
            }
        }
        setLoading(false);
    }, [toolId, router, toast]);


    const handleUpdate = (field: keyof Omit<Tool, 'id' | 'href'>, value: any) => {
        if (tool) {
            setTool(currentTool => {
                const updatedTool = { ...currentTool!, [field]: value };
                if (field === 'title') {
                    updatedTool.description = `A tool for creating and studying with ${value}.`;
                }
                return updatedTool;
            });
        }
    };

    const handleSave = () => {
        if (!tool) return;
        const storedToolsJSON = sessionStorage.getItem('managed-tools');
        const storedTools: Tool[] = storedToolsJSON ? JSON.parse(storedToolsJSON) : [];
        const updatedTools = storedTools.map(t => (t.id === tool.id ? { ...tool, href: `/${createSlug(tool.title)}` } : t));
        sessionStorage.setItem('managed-tools', JSON.stringify(updatedTools));
        
        toast({
            title: 'Tool Updated',
            description: `"${tool.title}" has been updated.`
        });
        router.push('/admin/tools');
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!tool) {
         return (
            <div className="text-center py-12">
                <p>Tool not found.</p>
                <Button variant="link" asChild><Link href="/admin/tools">Go Back</Link></Button>
            </div>
        );
    }
    
    const href = `/${createSlug(tool.title)}`;

    return (
        <>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Tool</h1>
                    <p className="text-muted-foreground">Configure the tool to make it available to users.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Tool Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Tool Name</Label>
                        <Input id="title" value={tool.title} onChange={(e) => handleUpdate('title', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={tool.description} onChange={(e) => handleUpdate('description', e.target.value)} />
                    </div>
                    <div>
                        <Label>Link (Auto-generated)</Label>
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md h-10 flex items-center font-mono">{href}</p>
                    </div>
                    <div>
                        <Label>Visibility</Label>
                        <RadioGroup
                            value={tool.visibility}
                            onValueChange={(value) => handleUpdate('visibility', value)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public">Public</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private">Private</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="coming-soon" 
                            checked={tool.isComingSoon} 
                            onCheckedChange={(checked) => handleUpdate('isComingSoon', checked)}
                        />
                        <Label htmlFor="coming-soon">Mark as "Coming Soon"</Label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                     <Button asChild variant="outline">
                        <Link href="/admin/tools"><ArrowLeft/> Back</Link>
                     </Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                </CardFooter>
            </Card>
        </>
    );
}
