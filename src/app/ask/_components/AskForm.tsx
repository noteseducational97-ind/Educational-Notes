
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/question-answer-flow';
import { generateAudio } from '@/ai/flows/tts-flow';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Trash2, Paperclip, X, History, LogIn, HelpCircle, PlusCircle, PanelRightClose, PanelRightOpen, Mic, MicOff, Volume2, PlayCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Message, Chat } from '@/types';
import { saveChat, getChatMessages, deleteChat } from '@/lib/firebase/chat';
import ChatHistoryPanel from './ChatHistoryPanel';


const formSchema = z.object({
  question: z.string().min(1, 'Cannot send an empty message.'),
});

type FormValues = z.infer<typeof formSchema>;

const defaultExamplePrompts = [
    'What is Beats frequency?',
    'What is electrochemistry?',
    'Generate an image of a cat programmer',
    'What is CPU?',
];

const GUEST_MESSAGE_LIMIT = 3;

export default function AskForm() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get('resourceId');
  const resourceTitle = searchParams.get('title');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  const examplePrompts = useMemo(() => {
    if (resourceTitle) {
      return [
        `What are the key concepts of "${resourceTitle}"?`,
        `Summarize "${resourceTitle}".`,
        `Explain the introduction of "${resourceTitle}".`,
        `Generate a short quiz about "${resourceTitle}".`,
      ];
    }
    return defaultExamplePrompts;
  }, [resourceTitle]);


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

   useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        form.setValue('question', transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({ variant: 'destructive', title: 'Voice Recognition Error', description: `Error: ${event.error}` });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
        console.warn("Speech recognition not supported by this browser.");
    }
  }, [form, toast]);
  
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
    setTimeout(() => {
        form.handleSubmit(onSubmit)();
    }, 0);
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
        toast({ variant: 'destructive', title: 'Not Supported', description: 'Voice recognition is not supported in your browser.' });
        return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  async function onSubmit(values: FormValues) {
    if (loading) return;

    if (!user) {
        const userMessagesCount = conversation.filter(m => m.role === 'user').length;
        if (userMessagesCount >= GUEST_MESSAGE_LIMIT) {
            setShowLoginDialog(true);
            return;
        }
    }

    setLoading(true);
    const userMessage: Message = { role: 'user', content: values.question, image: attachedImage ?? undefined, createdAt: new Date() };
    const currentConversation = [...conversation, userMessage];
    setConversation(currentConversation);
    form.reset();
    setAttachedImage(null);

    try {
      const result = await answerQuestion({
        question: values.question,
        photoDataUri: attachedImage ?? undefined,
        resourceId: resourceId ?? undefined,
      });
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: result.answer,
        generatedImage: result.imageUrl,
        createdAt: new Date(),
        suggestions: result.suggestions,
      };
      
      const finalConversation = [...currentConversation, assistantMessage];
      setConversation(finalConversation);

      if (user) {
        const newChatId = await saveChat(user.uid, chatId, finalConversation);
        setChatId(newChatId);
      }

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
  
  const handlePlayAudio = async (text: string, index: number) => {
    setAudioLoading(index);
    try {
        const result = await generateAudio(text);
        if (result.media) {
            const audio = new Audio(result.media);
            audio.play();
            audio.onended = () => setAudioLoading(null);
        } else {
            throw new Error('No audio data received.');
        }
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: 'Audio Playback Error',
            description: 'Could not generate or play audio. Please try again.',
        });
        setAudioLoading(null);
    }
  };

  const handleNewChat = () => {
    setConversation([]);
    setChatId(null);
    setIsHistoryPanelOpen(false);
    router.push('/ask');
  }

  const handleClearChat = async () => {
    if (chatId && user) {
        await deleteChat(user.uid, chatId);
        toast({ title: 'Chat Deleted', description: 'This conversation has been removed from your history.' });
    }
    handleNewChat();
  }
  
  const handleSelectChat = async (selectedChat: Chat) => {
    if (!user) return;
    setLoading(true);
    try {
        const messages = await getChatMessages(user.uid, selectedChat.id);
        setChatId(selectedChat.id);
        setConversation(messages);
        setIsHistoryPanelOpen(false);
    } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load the selected chat.' });
    } finally {
        setLoading(false);
    }
  }

  const lastMessage = conversation[conversation.length - 1];
  const showSuggestions = !loading && lastMessage?.role === 'assistant' && lastMessage.suggestions && lastMessage.suggestions.length > 0;

  return (
    <Card className="flex flex-col shadow-lg h-full w-full max-w-7xl overflow-hidden">
        <div className="flex h-full">
            <div className={cn("flex flex-col flex-1 transition-all duration-300", isHistoryPanelOpen && "sm:w-[calc(100%-350px)]")}>
                <CardHeader className="border-b">
                    <div className='flex justify-between items-center'>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={handleNewChat}>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
                            </Button>
                        </div>
                        <div className='text-center'>
                            <CardTitle className="text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>Educational AI Assistant</CardTitle>
                            <CardDescription>
                                {resourceId ? `Asking about "${resourceTitle}"` : 'Your personal AI-powered tutor. Ask anything!'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                           {!isHistoryPanelOpen && (
                            <Button variant="outline" size="sm" onClick={handleClearChat} disabled={conversation.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4"/> Clear
                            </Button>
                           )}
                            {user && (
                                <Button variant="outline" size="sm" onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}>
                                    {isHistoryPanelOpen ? <><PanelRightClose /> Hide History</> : <><PanelRightOpen /> Show History</>}
                                </Button>
                            )}
                        </div>
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
                                        {resourceId ? 'Ask a question about the document to start.' : 'Ask a question below to start the conversation.'}
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
                                                    className="text-left justify-start"
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
                                             {message.role === 'assistant' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePlayAudio(message.content, index)}
                                                    disabled={audioLoading !== null}
                                                    className="mt-2"
                                                >
                                                    {audioLoading === index ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <PlayCircle className="mr-2 h-4 w-4" />
                                                    )}
                                                    Play Audio
                                                </Button>
                                            )}
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="w-9 h-9 border flex-shrink-0">
                                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName ?? 'User'} />
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
                             {showSuggestions && (
                                <div className="flex justify-start pl-14">
                                    <div className="flex flex-col items-start gap-2 max-w-[75%]">
                                        {lastMessage.suggestions?.map((prompt, i) => (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExampleClick(prompt)}
                                                className="text-left justify-start text-sm h-auto whitespace-normal"
                                            >
                                                {prompt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="border-t pt-4 bg-primary/10">
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
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative flex w-full items-center rounded-full bg-background border shadow-sm">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="shrink-0 text-muted-foreground"
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
                                            <Input 
                                                placeholder={isListening ? "Listening..." : "e.g., What is this? Explain it to me."}
                                                {...field} 
                                                className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                                                        e.preventDefault();
                                                        if (form.getValues('question')) {
                                                        form.handleSubmit(onSubmit)();
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant={isListening ? "destructive" : "ghost"}
                                                size="icon"
                                                onClick={toggleListening}
                                                className="shrink-0 text-muted-foreground"
                                            >
                                                {isListening ? <MicOff /> : <Mic />}
                                                <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                                            </Button>
                                            <Button type="submit" disabled={loading || !form.getValues('question')} size="icon" className="shrink-0 rounded-full mr-1">
                                                {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                                <span className="sr-only">Send</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardFooter>
            </div>
            {user && (
                <div className={cn("hidden transition-all duration-300", isHistoryPanelOpen && "block")}>
                    <ChatHistoryPanel 
                        onSelectChat={handleSelectChat}
                        userId={user.uid}
                        isOpen={isHistoryPanelOpen}
                        onClose={() => setIsHistoryPanelOpen(false)}
                    />
                </div>
            )}
        </div>
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Message Limit Reached</AlertDialogTitle>
                <AlertDialogDescription>
                You've reached the message limit for guest users. Please sign in to continue your conversation with the Educational AI assistant.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
