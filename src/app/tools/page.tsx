
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Calculator, ArrowRight, ScanLine, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const availableTools = [
    {
        icon: <ScanLine className="h-8 w-8 text-primary" />,
        title: 'OMR Sheet Maker',
        href: '#',
    }
]

const comingSoonTools = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-muted-foreground" />,
    title: 'AI Problem Solver',
  },
  {
    icon: <FileText className="h-6 w-6 text-muted-foreground" />,
    title: 'AI Test Maker',
  },
  {
    icon: <Calculator className="h-6 w-6 text-muted-foreground" />,
    title: 'GPA & Percentage Calculator',
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
                <div className="grid grid-cols-1 gap-8">
                    {availableTools.map((tool) => (
                        <Card 
                            key={tool.title}
                            className="group flex flex-col h-full transition-all duration-300 hover:shadow-lg"
                        >
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {tool.icon}
                                        <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                                    </div>
                                </div>
                                <Button>
                                    Launch Tool <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                 <Card className="group flex flex-col h-full bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Coming Soon</CardTitle>
                        <CardDescription>We're working on bringing you more exciting tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                       {comingSoonTools.map(tool => (
                            <div key={tool.title} className="flex items-center gap-3 text-muted-foreground">
                                {tool.icon}
                                <span className="font-medium">{tool.title}</span>
                            </div>
                       ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
