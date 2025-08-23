
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/question-answer-flow';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  question: z.string().min(1, 'Cannot send an empty message.'),
});

type Message = {
    role: 'user' | 'assistant';
    content: string;
}

const exampleQuestions = [
    "Explain the concept of photosynthesis in simple terms.",
    "What was the significance of the Treaty of Versailles?",
    "Can you give me a summary of Shakespeare's 'Hamlet'?",
    "Describe the basic principles of supply and demand in economics."
]

export default function AskForm() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    // Scroll to the bottom when conversation changes
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [conversation]);

  const handleExampleClick = (question: string) => {
    form.setValue('question', question);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const userMessage: Message = { role: 'user', content: values.question };
    setConversation(prev => [...prev, userMessage]);
    form.reset();

    try {
      const result = await answerQuestion({
        question: values.question,
      });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating answer',
        description: 'The AI might be busy. Please try again later.',
      });
       setConversation(prev => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
       <Card className="flex-1 flex flex-col shadow-lg h-[calc(100vh-10rem)]">
         <CardHeader className="border-b">
            <div className='flex justify-between items-center'>
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>AI Assistant</CardTitle>
                    <CardDescription>Your personal AI-powered tutor. Ask anything!</CardDescription>
                </div>
                {conversation.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setConversation([])}>
                        <Trash2 className="mr-2 h-4 w-4"/> Clear Chat
                    </Button>
                )}
            </div>
         </CardHeader>
         <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                    {conversation.length === 0 ? (
                        <div className="text-center py-12">
                             <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                             <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                             <p className="mt-1 text-sm text-muted-foreground">
                                Ask a question below to start the conversation. Or try one of these examples:
                             </p>
                             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {exampleQuestions.map((q, i) => (
                                    <Button key={i} variant="outline" size="sm" className="text-left h-auto py-2" onClick={() => handleExampleClick(q)}>
                                        {q}
                                    </Button>
                                ))}
                             </div>
                        </div>
                    ) : (
                        conversation.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' && 'justify-end')}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-9 h-9 border flex-shrink-0">
                                        <div className='bg-primary w-full h-full flex items-center justify-center'>
                                             <Sparkles className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-[75%] rounded-2xl p-4",
                                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'
                                )}>
                                    <p className="text-sm prose prose-sm dark:prose-invert max-w-none">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-9 h-9 border flex-shrink-0">
                                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
                                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                         <div className="flex items-start gap-4">
                            <Avatar className="w-9 h-9 border">
                                <div className='bg-primary w-full h-full flex items-center justify-center'>
                                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                                </div>
                            </Avatar>
                             <div className="rounded-2xl p-4 bg-secondary rounded-bl-none flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                             </div>
                         </div>
                    )}
                </div>
            </ScrollArea>
         </CardContent>
         <CardFooter className="border-t pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-start gap-4">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                            <Textarea 
                                placeholder="e.g., What is the law of conservation of energy?" 
                                {...field} 
                                rows={1}
                                className="resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!loading && form.getValues('question')) {
                                          form.handleSubmit(onSubmit)();
                                        }
                                    }
                                }}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={loading} size="icon" className="w-10 h-10 flex-shrink-0">
                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </Form>
         </CardFooter>
       </Card>
    </div>
  );
}
