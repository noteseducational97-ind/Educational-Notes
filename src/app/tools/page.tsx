
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    BrainCircuit, 
    Calculator, 
    ArrowRight, 
    ScanLine, 
    FileText, 
    GraduationCap, 
    CalendarClock, 
    Quote, 
    PenLine, 
    FunctionSquare,
    Voicemail,
    Share2,
    Copy,
    Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tool = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  isComingSoon?: boolean;
};

const allTools: Tool[] = [
    {
        icon: <ScanLine className="h-8 w-8 text-primary" />,
        title: 'OMR Sheet Maker',
        description: 'Generate and print custom OMR sheets for exam practice.',
        href: '#',
    },
    {
        icon: <Calculator className="h-8 w-8 text-primary" />,
        title: 'Percentage Calculator',
        description: 'Quickly calculate percentages for marks, attendance, or other needs.',
        href: '#',
    },
    {
        icon: <Copy className="h-8 w-8 text-primary" />,
        title: 'Flashcard Maker',
        description: 'Create and study with digital flashcards for any subject.',
        href: '#',
    },
    {
        icon: <Sparkles className="h-8 w-8 text-muted-foreground" />,
        title: 'AI Problem Solver',
        description: 'Get step-by-step solutions and explanations for complex problems.',
        isComingSoon: true,
    },
    {
        icon: <FileText className="h-8 w-8 text-muted-foreground" />,
        title: 'AI Test Maker',
        description: 'Generate practice tests and quizzes from your study material.',
        isComingSoon: true,
    },
    {
        icon: <GraduationCap className="h-8 w-8 text-muted-foreground" />,
        title: 'AI-Powered Essay Grader',
        description: 'Receive instant feedback on your essays for grammar, style, and clarity.',
        isComingSoon: true,
    },
    {
        icon: <CalendarClock className="h-8 w-8 text-muted-foreground" />,
        title: 'Study Planner',
        description: 'Organize your study schedule and track your progress towards goals.',
        isComingSoon: true,
    },
    {
        icon: <Quote className="h-8 w-8 text-muted-foreground" />,
        title: 'Citation Generator',
        description: 'Easily create citations in MLA, APA, and other formats.',
        isComingSoon: true,
    },
    {
        icon: <PenLine className="h-8 w-8 text-muted-foreground" />,
        title: 'Handwriting to Text',
        description: 'Convert your handwritten notes into editable digital text.',
        isComingSoon: true,
    },
    {
        icon: <FunctionSquare className="h-8 w-8 text-muted-foreground" />,
        title: 'Formula Sheet Generator',
        description: 'Create personalized formula sheets for quick reference during study.',
        isComingSoon: true,
    },
    {
        icon: <Voicemail className="h-8 w-8 text-muted-foreground" />,
        title: 'AI Voice Tutor',
        description: 'Practice pronunciation and have spoken conversations with an AI tutor.',
        isComingSoon: true,
    },
    {
        icon: <Share2 className="h-8 w-8 text-muted-foreground" />,
        title: 'Concept Map Generator',
        description: 'Visualize complex topics by automatically generating concept maps.',
        isComingSoon: true,
    }
];


export default function ToolsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl">Our Tools</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    A suite of powerful tools designed to help you study smarter and achieve your academic goals.
                </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTools.map((tool) => (
                    <Card 
                        key={tool.title}
                        className="group flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-primary/50"
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                {tool.icon}
                                {tool.isComingSoon && <Badge variant="outline">Coming Soon</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                            <CardDescription className="mt-2">{tool.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                onClick={() => tool.href && router.push(tool.href)} 
                                disabled={!!tool.isComingSoon || !tool.href}
                                className="w-full"
                            >
                                Launch Tool <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
