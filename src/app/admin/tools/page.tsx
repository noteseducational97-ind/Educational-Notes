
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, PlusCircle, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type Tool = {
    id: string;
    title: string;
    description: string;
    href: string;
    visibility: 'public' | 'private';
    isComingSoon: boolean;
};

const initialTools: Tool[] = [
    {
        id: 'new-tool',
        title: 'Admission Form',
        description: 'A tool for creating and studying with New Tool.',
        href: '/admission',
        visibility: 'public',
        isComingSoon: false,
    },
    {
        id: 'flashcard-maker',
        title: 'Flashcard Maker',
        description: 'A tool for creating and studying with Flashcard Maker.',
        href: '#',
        visibility: 'private',
        isComingSoon: true,
    }
];

export default function AdminToolsPage() {
    const [tools, setTools] = useState(initialTools);
    const { toast } = useToast();
    const [editingToolId, setEditingToolId] = useState<string | null>(null);

    const handleAddNewTool = () => {
        const newToolId = `new-tool-${Date.now()}`;
        const newTool: Tool = {
            id: newToolId,
            title: 'Untitled Tool',
            description: 'A tool for creating and studying with Untitled Tool.',
            href: '#',
            visibility: 'private',
            isComingSoon: true,
        };
        setTools(currentTools => [...currentTools, newTool]);
        setEditingToolId(newToolId); // Immediately open the new tool for editing
        toast({
            title: 'New Tool Added',
            description: 'A new tool has been added. Configure it below.'
        });
    };

    const handleSave = (toolId: string) => {
        setEditingToolId(null);
        const tool = tools.find(t => t.id === toolId);
        toast({
            title: 'Tool Saved',
            description: `"${tool?.title}" has been saved.`
        });
    }

    const handleUpdate = (toolId: string, field: keyof Tool, value: any) => {
        setTools(currentTools =>
            currentTools.map(t => {
                if (t.id === toolId) {
                    const updatedTool = { ...t, [field]: value };
                    if (field === 'title') {
                        updatedTool.description = `A tool for creating and studying with ${value}.`;
                    }
                    return updatedTool;
                }
                return t;
            })
        );
    };

    const handleDelete = (toolId: string) => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            setTools(currentTools => currentTools.filter(t => t.id !== toolId));
            toast({
                title: `"${tool.title}" Deleted`,
                description: `The tool has been removed.`,
                variant: 'destructive'
            });
        }
    };
    
    const ToolCard = ({ tool }: { tool: Tool }) => (
        <Card className="flex flex-col">
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
                <Button variant="outline" size="sm" onClick={() => setEditingToolId(tool.id)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
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

    const EditingToolCard = ({ tool }: { tool: Tool }) => (
        <Card>
            <CardHeader>
                <CardTitle>Editing: {tool.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor={`title-${tool.id}`}>Tool Name</Label>
                    <Input id={`title-${tool.id}`} value={tool.title} onChange={(e) => handleUpdate(tool.id, 'title', e.target.value)} />
                </div>
                <div>
                    <Label>Description (Auto-generated)</Label>
                    <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md h-10 flex items-center">{tool.description}</p>
                </div>
                 <div>
                    <Label htmlFor={`href-${tool.id}`}>Link</Label>
                    <Input id={`href-${tool.id}`} value={tool.href} onChange={(e) => handleUpdate(tool.id, 'href', e.target.value)} />
                </div>
                <div>
                    <Label>Visibility</Label>
                    <RadioGroup
                        value={tool.visibility}
                        onValueChange={(value) => handleUpdate(tool.id, 'visibility', value)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id={`public-${tool.id}`} />
                            <Label htmlFor={`public-${tool.id}`}>Public</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id={`private-${tool.id}`} />
                            <Label htmlFor={`private-${tool.id}`}>Private</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id={`coming-soon-${tool.id}`} 
                        checked={tool.isComingSoon} 
                        onCheckedChange={(checked) => handleUpdate(tool.id, 'isComingSoon', checked)}
                    />
                    <Label htmlFor={`coming-soon-${tool.id}`}>Mark as "Coming Soon"</Label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive-outline">
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
                <Button onClick={() => handleSave(tool.id)}><Save className="mr-2 h-4 w-4" /> Save</Button>
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
                 <Button onClick={handleAddNewTool}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Tool
                </Button>
            </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    editingToolId === tool.id 
                        ? <EditingToolCard key={tool.id} tool={tool} />
                        : <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </>
    );
}
