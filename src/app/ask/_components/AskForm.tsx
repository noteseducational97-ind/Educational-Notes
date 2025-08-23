
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/question-answer-flow';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Trash2, Paperclip, X, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

const formSchema = z.object({
  question: z.string().min(1, 'Cannot send an empty message.'),
});

type Message = {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
    generatedImage?: string;
}

const examplePrompts = [
    'What is Beats frequency?',
    'What is electrochemistry?',
    'Generate an image of a cat programmer',
    'What is CPU?',
];

export default function AskForm() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100);
        }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, scrollToBottom]);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExampleClick = (prompt: string) => {
    form.setValue('question', prompt);
    // Use a timeout to ensure the value is set before submitting
    setTimeout(() => {
        form.handleSubmit(onSubmit)();
    }, 0);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (loading) return;
    setLoading(true);
    const userMessage: Message = { role: 'user', content: values.question, image: attachedImage ?? undefined };
    setConversation(prev => [...prev, userMessage]);
    form.reset();
    setAttachedImage(null);

    try {
      const result = await answerQuestion({
        question: values.question,
        photoDataUri: attachedImage ?? undefined
      });
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: result.answer,
        generatedImage: result.imageUrl,
      };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating answer',
        description: 'The AI might be busy. Please try again later.',
      });
       setConversation(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full max-w-5xl">
       <Card className="flex flex-col shadow-lg h-full">
         <CardHeader className="border-b">
            <div className='flex justify-between items-center'>
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>AI Assistant</CardTitle>
                    <CardDescription>Your personal AI-powered tutor. Ask anything!</CardDescription>
                </div>
                {conversation.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { /* Implement history logic here */ }}>
                            <History className="mr-2 h-4 w-4"/> History
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConversation([])}>
                            <Trash2 className="mr-2 h-4 w-4"/> Clear Chat
                        </Button>
                    </div>
                )}
            </div>
         </CardHeader>
         <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                    {conversation.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                             <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                             <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                             <p className="mt-1 text-sm text-muted-foreground max-w-md">
                                Ask a question below to start the conversation.
                             </p>
                            <div className="mt-8 w-full max-w-2xl">
                                <p className="mb-4 text-sm font-medium text-muted-foreground">
                                    Or try one of these examples:
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {examplePrompts.map((prompt, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            onClick={() => handleExampleClick(prompt)}
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </div>
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
                                    "max-w-[75%] rounded-2xl p-4 space-y-2",
                                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'
                                )}>
                                    {message.image && (
                                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                        <Image src={message.image} alt="User upload" fill className="object-contain" />
                                      </div>
                                    )}
                                    <p className="text-sm prose prose-sm dark:prose-invert max-w-none">{message.content}</p>
                                    {message.generatedImage && (
                                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-2">
                                        <Image src={message.generatedImage} alt="Generated image" fill className="object-contain" />
                                      </div>
                                    )}
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
         <CardFooter className="border-t pt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-3">
                   {attachedImage && (
                        <div className="relative w-32 h-32">
                        <Image src={attachedImage} alt="Preview" fill className="object-cover rounded-md" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/75 text-white rounded-full"
                            onClick={() => setAttachedImage(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                <Textarea 
                                    placeholder="e.g., What is this? Explain it to me." 
                                    {...field} 
                                    rows={1}
                                    className="resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !loading) {
                                            e.preventDefault();
                                            if (form.getValues('question')) {
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
                        <Button type="submit" disabled={loading} size="icon" className="shrink-0">
                            {loading ? <Loader2 className="animate-spin" /> : <Send />}
                            <span className="sr-only">Send</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0"
                        >
                            <Paperclip />
                            <span className="sr-only">Attach file</span>
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                </form>
            </Form>
         </CardFooter>
       </Card>
    </div>
  );
}
