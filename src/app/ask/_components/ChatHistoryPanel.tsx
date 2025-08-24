
'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { getChatHistory } from '@/lib/firebase/chat';
import type { Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

type ChatHistoryPanelProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectChat: (chat: Chat) => void;
  userId: string;
};

export default function ChatHistoryPanel({
  isOpen,
  onOpenChange,
  onSelectChat,
  userId,
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
        <SheetHeader>
          <SheetTitle>Chat History</SheetTitle>
          <SheetDescription>
            Select a previous conversation to continue.
          </SheetDescription>
        </SheetHeader>
        <div className="h-[calc(100%-4rem)]">
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
                        onClick={() => onSelectChat(chat)}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
