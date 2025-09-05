
'use client';

import { useEffect, useState } from 'react';
import { deleteChat, getChatHistory } from '@/lib/firebase/chat';
import type { Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, X, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

type ChatHistoryPanelProps = {
  onSelectChat: (chat: Chat) => void;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatHistoryPanel({
  onSelectChat,
  userId,
  isOpen,
  onClose,
}: ChatHistoryPanelProps) {
  const [history, setHistory] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getChatHistory(userId)
        .then(setHistory)
        .catch(() =>
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load chat history.',
          })
        )
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId, toast]);

  const handleSelectChat = (chat: Chat) => {
    onSelectChat(chat);
  }
  
  const handleDeleteChat = async (chatId: string) => {
    try {
        await deleteChat(userId, chatId);
        setHistory(prev => prev.filter(chat => chat.id !== chatId));
        toast({
            title: 'Chat Deleted',
            description: 'The conversation has been removed from your history.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete chat.',
        });
    }
};

 const handleNewChat = () => {
    router.push('/ask');
    onClose();
  }

  return (
    <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[300px] bg-background border-r flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
        <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">History</h2>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                {loading ? (
                <div className="flex justify-center items-center h-full">
                    <LoadingSpinner className="min-h-0" />
                </div>
                ) : history.length > 0 ? (
                <div className="space-y-1 p-2">
                    {history.map((chat) => (
                    <div
                        key={chat.id}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted border border-transparent hover:border-border"
                    >
                        <div
                            className="flex-grow cursor-pointer"
                            onClick={() => handleSelectChat(chat)}
                        >
                            <p className="font-medium text-sm truncate">
                                {chat.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this chat history.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteChat(chat.id);
                                        }}
                                        variant="destructive"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <MessageSquare className="h-10 w-10 mb-4" />
                    <p className="font-medium text-sm">No History Found</p>
                    <p className="text-xs">Your past conversations will appear here.</p>
                </div>
                )}
            </ScrollArea>
        </div>
    </div>
  );
}
