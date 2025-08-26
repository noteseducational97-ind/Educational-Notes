
'use server';

import { db } from '@/lib/firebase/server';
import type { Message, Chat } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const getChatTitle = (messages: Message[]): string => {
    return messages[0]?.content.substring(0, 40) || 'New Chat';
}

export async function saveChat(userId: string, chatId: string | null, messages: Message[]): Promise<string> {
    const chatRef = chatId 
        ? db.collection('users').doc(userId).collection('chats').doc(chatId)
        : db.collection('users').doc(userId).collection('chats').doc();

    const messagesForDb = messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt instanceof Date ? Timestamp.fromDate(msg.createdAt) : FieldValue.serverTimestamp(),
    }));

    await chatRef.set({
        id: chatRef.id,
        title: getChatTitle(messages),
        messages: messagesForDb,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return chatRef.id;
}


export async function getChatHistory(userId: string): Promise<Chat[]> {
    const snapshot = await db.collection('users').doc(userId).collection('chats')
                         .orderBy('updatedAt', 'desc')
                         .get();
    
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const updatedAt = (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return {
            id: doc.id,
            title: data.title,
            updatedAt: updatedAt,
        };
    });
}

export async function getChatMessages(userId: string, chatId: string): Promise<Message[]> {
    const doc = await db.collection('users').doc(userId).collection('chats').doc(chatId).get();

    if (!doc.exists) {
        throw new Error('Chat not found');
    }

    const data = doc.data();
    if (!data || !data.messages) {
        return [];
    }

    return data.messages.map((msg: any) => ({
        ...msg,
        createdAt: (msg.createdAt as Timestamp)?.toDate() || new Date(),
    }));
}


export async function deleteChat(userId: string, chatId: string): Promise<void> {
    await db.collection('users').doc(userId).collection('chats').doc(chatId).delete();
    // No path revalidation needed as history is fetched on client-side
}

    
