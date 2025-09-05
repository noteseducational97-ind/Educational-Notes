
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/question-answer-flow';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Send, Trash2, Paperclip, X, History, LogIn, PlusCircle, PanelLeft, Copy, Download } from 'lucide-react';
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
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';


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

const GUEST_MESSAGE_LIMIT = 5;

export default function AskForm() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get('resourceId');
  const resourceTitle = searchParams.get('title');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The answer has been copied.',
    });
  }

  const handleDownload = (content: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save('answer.pdf');
    toast({
      title: 'Download Started',
      description: 'Your answer is being downloaded as a PDF.',
    });
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
        if(!chatId) {
            setChatId(newChatId);
        }
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
    <div className="flex h-full w-full">
      {user && (
        <ChatHistoryPanel 
          userId={user.uid}
          isOpen={isHistoryPanelOpen}
          onClose={() => setIsHistoryPanelOpen(false)}
          onSelectChat={handleSelectChat}
        />
      )}
      <div className="flex flex-col flex-1 h-full relative">
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center gap-4 z-10">
           {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHistoryPanelOpen(true)}
              >
                <PanelLeft />
              </Button>
           )}
          <div className='flex items-center gap-2'>
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <PlusCircle className="mr-2" />
              New Chat
            </Button>
            {conversation.length > 0 && (
                 <Button variant="destructive" size="sm" onClick={handleClearChat}>
                    <Trash2 className="mr-2" />
                    Clear
                </Button>
            )}
          </div>
        </header>
        
        <div className="flex-1 relative pt-20 pb-40">
          <ScrollArea className="absolute inset-0 pt-4 pb-4" ref={scrollAreaRef}>
            <div className="mx-auto max-w-4xl w-full px-6 space-y-8">
              {conversation.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="mx-auto h-12 w-12 text-primary" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-foreground">How can I help you today?</h3>
                  <p className="mt-2 text-md text-muted-foreground max-w-md">
                    {resourceId ? 'Ask a question about the document to start.' : 'Ask a question below to start the conversation.'}
                  </p>
                  <div className="mt-8 w-full max-w-2xl">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {examplePrompts.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          onClick={() => handleExampleClick(prompt)}
                          className="text-left justify-start h-auto whitespace-normal p-4 hover:bg-muted"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div key={index} className={cn("flex items-start gap-4 group/message")}>
                    {message.role === 'assistant' ? (
                      <Avatar className="w-9 h-9 border flex-shrink-0">
                        <div className='bg-primary w-full h-full flex items-center justify-center'>
                          <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </Avatar>
                    ) : (
                      <Avatar className="w-9 h-9 border flex-shrink-0">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName ?? 'User'} />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 space-y-2">
                      <p className="font-bold">{message.role === 'user' ? 'You' : 'AI Assistant'}</p>
                      {message.image && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <Image src={message.image} alt="User upload" fill className="object-contain" />
                        </div>
                      )}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.generatedImage && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-2 border">
                          <Image src={message.generatedImage} alt="Generated image" fill className="object-contain" />
                        </div>
                      )}
                       {message.role === 'assistant' && (
                          <div className="opacity-0 group-hover/message:opacity-100 transition-opacity self-center flex gap-1 -ml-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(message.content)}>
                              <Copy className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(message.content)}>
                              <Download className="h-4 w-4"/>
                            </Button>
                          </div>
                      )}
                    </div>
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
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
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
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent from-background via-background/80 to-transparent bg-gradient-to-t">
          <div className="mx-auto max-w-4xl w-full">
            <div className="rounded-2xl border bg-card p-2 shadow-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-3">
                  {attachedImage && (
                    <div className="relative w-32 h-32 p-2">
                      <Image src={attachedImage} alt="Preview" fill className="object-cover rounded-md border" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-6 w-6 bg-black/50 hover:bg-black/75 text-white rounded-full"
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
                          <div className="relative flex w-full items-center">
                            <Input
                              placeholder={resourceId ? `Ask a question about "${resourceTitle}"` : "e.g., What is this? Explain it to me."}
                              {...field}
                              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 pl-12 pr-24"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                                        e.preventDefault();
                                        if (form.getValues('question')) {
                                        form.handleSubmit(onSubmit)();
                                        }
                                    }
                                }}
                            />
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-muted-foreground rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
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
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                <Button type="submit" disabled={loading || !form.getValues('question')} size="icon" className="shrink-0 rounded-full">
                                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2 px-4">
              This AI is for educational purposes. Responses may be inaccurate; please verify important information.
            </p>
          </div>
        </div>
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
    </div>
  );
}
