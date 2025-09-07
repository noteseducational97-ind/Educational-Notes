
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wrench, Eye, EyeOff, PlusCircle, Save, Edit, Trash2, Shield, Globe } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

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
        id: 'admission-form',
        title: 'Admission Form',
        description: 'Allow users to access and fill out admission forms.',
        href: '/admission',
        visibility: 'public',
        isComingSoon: false,
    },
    {
        id: 'flashcard-maker',
        title: 'Flashcard Maker',
        description: 'A tool for creating and studying with digital flashcards.',
        href: '#',
        visibility: 'private',
        isComingSoon: true,
    }
];

export default function AdminToolsPage() {
    const [tools, setTools] = useState(initialTools);
    const { toast } = useToast();

    const handleSave = (toolId: string) => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            toast({
                title: `"${tool.title}" Saved`,
                description: `Settings for the tool have been updated.`,
            });
        }
    };
    
    const handleUpdate = <K extends keyof Tool>(toolId: string, field: K, value: Tool[K]) => {
        setTools(currentTools =>
            currentTools.map(tool =>
                tool.id === toolId ? { ...tool, [field]: value } : tool
            )
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tool Management</h1>
                    <p className="text-muted-foreground">Configure the tools available to users on the platform.</p>
                </div>
                 <Button asChild>
                    <Link href="#">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Tool
                    </Link>
                </Button>
            </div>
            <div className="space-y-8">
                {tools.map((tool) => (
                    <Card key={tool.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench /> 
                                {tool.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor={`title-${tool.id}`}>Tool Name</Label>
                                <Input 
                                    id={`title-${tool.id}`} 
                                    value={tool.title} 
                                    onChange={(e) => handleUpdate(tool.id, 'title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`desc-${tool.id}`}>Description</Label>
                                <Textarea 
                                    id={`desc-${tool.id}`} 
                                    value={tool.description}
                                    onChange={(e) => handleUpdate(tool.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                 <RadioGroup
                                    value={tool.visibility}
                                    onValueChange={(value) => handleUpdate(tool.id, 'visibility', value as 'public' | 'private')}
                                    className="flex items-center gap-4"
                                >
                                    <Label className={cn("flex items-center gap-2 cursor-pointer p-2 rounded-md border-2", tool.visibility === 'public' && "border-primary")}>
                                        <RadioGroupItem value="public" id={`public-${tool.id}`} className="sr-only" />
                                        <Globe /> Public
                                    </Label>
                                    <Label className={cn("flex items-center gap-2 cursor-pointer p-2 rounded-md border-2", tool.visibility === 'private' && "border-primary")}>
                                        <RadioGroupItem value="private" id={`private-${tool.id}`} className="sr-only" />
                                        <Shield /> Private
                                    </Label>
                                </RadioGroup>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`coming-soon-${tool.id}`} 
                                    checked={tool.isComingSoon}
                                    onCheckedChange={(checked) => handleUpdate(tool.id, 'isComingSoon', !!checked)}
                                />
                                <Label htmlFor={`coming-soon-${tool.id}`} className="cursor-pointer">
                                    Mark as "Coming Soon"
                                </Label>
                            </div>
                        </CardContent>
                         <CardFooter className="flex justify-end gap-2 border-t pt-4">
                            <Button variant="destructive-outline">
                                <Trash2 /> Delete
                            </Button>
                            <Button onClick={() => handleSave(tool.id)}>
                                <Save /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}
