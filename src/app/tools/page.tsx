
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calculator, Copy, ClipboardEdit, ArrowRight, EyeOff, Wrench, FileQuestion } from 'lucide-react';
import type { Tool } from '../admin/tools/page';
import { initialTools } from '@/lib/data';
import { Badge } from '@/components/ui/badge';


export default function ToolsPage() {
    const publicTools = initialTools.filter(tool => tool.visibility === 'public');
    
    const getToolIcon = (id: string) => {
        switch(id) {
            case 'admission-form': return <ClipboardEdit className="h-8 w-8 text-primary" />;
            case 'flashcard-maker': return <Copy className="h-8 w-8 text-primary" />;
            case 'test-generator': return <FileQuestion className="h-8 w-8 text-primary" />;
            default: return <Wrench className="h-8 w-8 text-primary" />;
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section id="tools" className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Our Tools</h1>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                        Powerful utilities designed to help you study smarter and achieve your academic goals.
                    </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {publicTools.map((tool) => (
                        <Card 
                        key={tool.title}
                        className="group flex flex-col h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50 bg-background/50 border-border"
                        >
                        <CardHeader>
                            <div className="flex items-center gap-4">
                            {getToolIcon(tool.id)}
                            <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{tool.description}</CardDescription>
                            {tool.isComingSoon && <Badge variant="outline" className="mt-2">Coming Soon</Badge>}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="secondary" className="w-full" disabled={tool.isComingSoon || !tool.href || tool.href === '#'}>
                                <Link href={tool.href ?? '#'}>Launch Tool <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                        </Card>
                    ))}
                    </div>
                </div>
                </section>
            </main>
        </div>
    );
}

