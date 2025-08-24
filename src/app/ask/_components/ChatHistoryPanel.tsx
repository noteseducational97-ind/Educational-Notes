
'use client';

import { useEffect, useState } from 'react';
import { getChatHistory } from '@/lib/firebase/chat';
import type { Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  return (
    <Card className="h-full w-[350px] border-l-2 border-r-0 border-t-0 border-b-0 rounded-none flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
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
                        className="p-3 rounded-lg hover:bg-accent cursor-pointer border"
                        onClick={() => handleSelectChat(chat)}
                    >
                        <p className="font-semibold truncate">
                        {chat.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </p>
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
