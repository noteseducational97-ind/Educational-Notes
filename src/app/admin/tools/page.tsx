
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wrench, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialTools = [
    {
        id: 'admission-form',
        title: 'Admission Form',
        description: 'Allow users to access and fill out admission forms.',
        href: '/admission',
        isEnabled: true,
    },
    {
        id: 'flashcard-maker',
        title: 'Flashcard Maker',
        description: 'A tool for creating and studying with digital flashcards.',
        href: '#',
        isEnabled: false,
    }
];

export default function AdminToolsPage() {
    const [tools, setTools] = useState(initialTools);
    const { toast } = useToast();

    const handleToggle = (toolId: string) => {
        setTools(currentTools =>
            currentTools.map(tool =>
                tool.id === toolId ? { ...tool, isEnabled: !tool.isEnabled } : tool
            )
        );
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            toast({
                title: `${tool.title} ${!tool.isEnabled ? 'Enabled' : 'Disabled'}`,
                description: `The ${tool.title} tool is now ${!tool.isEnabled ? 'visible' : 'hidden'} to users.`,
            });
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tool Management</h1>
                    <p className="text-muted-foreground">Enable or disable tools available to users.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wrench /> Available Tools</CardTitle>
                    <CardDescription>
                        Control the visibility of each tool on the public Tools page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {tools.map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-semibold text-lg">{tool.title}</h3>
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`switch-${tool.id}`}
                                    checked={tool.isEnabled}
                                    onCheckedChange={() => handleToggle(tool.id)}
                                    aria-label={`Toggle ${tool.title}`}
                                />
                                <Label htmlFor={`switch-${tool.id}`} className="flex items-center gap-1">
                                    {tool.isEnabled ? <><Eye className="h-4 w-4" /> Visible</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
                                </Label>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    );
}
