
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Calculator, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const tools = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'AI Problem Solver',
    href: '#',
    status: 'Coming Soon'
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: 'GPA & Percentage Calculator',
    href: '#',
    status: 'Coming Soon'
  },
];

export default function ToolsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Our Tools</h1>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    A suite of tools designed to help you study smarter and achieve your academic goals.
                </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {tools.map((tool) => (
                    <Card 
                        key={tool.title}
                        className="group flex flex-col h-full transition-all duration-300"
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {tool.icon}
                                    <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                                </div>
                                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                                    {tool.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             {/* Content can go here if needed in the future */}
                        </CardContent>
                        <CardContent>
                             <Button disabled>
                                Launch Tool <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </div>
      </main>
    </div>
  );
}
