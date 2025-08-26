
'use client';

import { useEffect, useState } from 'react';
import { deleteChat, getChatHistory } from '@/lib/firebase/chat';
import type { Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, X } from 'lucide-react';
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
    onClose();
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

  return (
    <Card className="h-full w-[350px] border-l rounded-none flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center border-b">
            <div>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>
                    Select a past conversation.
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                {loading ? (
                <div className="flex justify-center items-center h-full">
                    <LoadingSpinner className="min-h-0" />
                </div>
                ) : history.length > 0 ? (
                <div className="space-y-2 p-4">
                    {history.map((chat) => (
                    <div
                        key={chat.id}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 border"
                    >
                        <div
                            className="flex-grow cursor-pointer"
                            onClick={() => handleSelectChat(chat)}
                        >
                            <p className="font-semibold truncate">
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
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <p className="font-medium">No History Found</p>
                    <p className="text-sm">Your past conversations will appear here.</p>
                </div>
                )}
            </ScrollArea>
        </CardContent>
    </Card>
  );
}

    

    