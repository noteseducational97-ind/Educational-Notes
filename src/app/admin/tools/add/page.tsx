
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useRouter } from 'next/navigation';


type Tool = {
    id: string;
    title: string;
    description: string;
    href: string;
    visibility: 'public' | 'private';
    isComingSoon: boolean;
};

export default function AddToolPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tool, setTool] = useState<Tool>({
        id: `new-tool-${Date.now()}`,
        title: 'Untitled Tool',
        description: 'A tool for creating and studying with Untitled Tool.',
        href: '#',
        visibility: 'private',
        isComingSoon: true,
    });

    useEffect(() => {
        setTool(prev => ({
            ...prev,
            description: `A tool for creating and studying with ${prev.title}.`
        }));
    }, [tool.title]);

    const handleUpdate = (field: keyof Omit<Tool, 'id' | 'description'>, value: any) => {
        setTool(currentTool => ({ ...currentTool, [field]: value }));
    };

    const handleSave = () => {
        // In a real app, you would save this to a database
        toast({
            title: 'Tool Created',
            description: `"${tool.title}" has been created.`
        });
        router.push('/admin/tools');
    }

    return (
        <>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Add New Tool</h1>
                    <p className="text-muted-foreground">Configure the new tool to make it available to users.</p>
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
                        <Label>Description (Auto-generated)</Label>
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md h-10 flex items-center">{tool.description}</p>
                    </div>
                    <div>
                        <Label htmlFor="href">Link</Label>
                        <Input id="href" value={tool.href} onChange={(e) => handleUpdate('href', e.target.value)} />
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
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Tool</Button>
                </CardFooter>
            </Card>
        </>
    );
}
