
'use server';

import { addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/server'; // Use server-side db
import { revalidatePath } from 'next/cache';
import type { Resource as ResourceType } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

export type Resource = ResourceType & {
  createdAt: string;
};

// The type for the function argument should not have id or createdAt
export type AddResourceData = Omit<ResourceType, 'id' | 'createdAt'>;

export async function addResource(resource: AddResourceData) {
  try {
    const resourcesCollection = db.collection('resources');
    const slug = resource.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    await resourcesCollection.doc(slug).set({
        ...resource,
        id: slug,
        createdAt: FieldValue.serverTimestamp(),
    });
    
    revalidatePath('/admin');
    revalidatePath('/downloads');
  } catch (error: any)
 {
    console.error('Error adding resource to Firestore: ', error);
    throw new Error('Could not add resource.');
  }
}

export async function getResources(): Promise<Resource[]> {
    try {
        const resourcesCollection = db.collection('resources');
        const querySnapshot = await resourcesCollection.orderBy('createdAt', 'desc').get();
        
        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate().toISOString();

            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                content: data.content,
                category: data.category,
                subject: data.subject,
                class: data.class,
                stream: data.stream,
                imageUrl: data.imageUrl,
                pdfUrl: data.pdfUrl,
                downloadUrl: data.downloadUrl,
                createdAt: createdAt,
            } as Resource;
        });
    } catch (error) {
        console.error("Error fetching resources: ", error);
        return [];
    }
}

export async function getResourceById(id: string): Promise<Resource | null> {
    try {
        const docRef = db.collection('resources').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log('No such document in resources!');
            return null;
        }

        const data = docSnap.data();
        if (!data) return null;

        const createdAt = data.createdAt.toDate().toISOString();

        return {
            id: docSnap.id,
            ...data,
            createdAt,
        } as Resource;
    } catch (error) {
        console.error("Error fetching resource by ID: ", error);
        return null;
    }
}

export async function addToWatchlist(userId: string, resourceId: string) {
    if (!userId) {
        throw new Error('User is not authenticated.');
    }
    try {
        const watchlistRef = db.collection('users').doc(userId).collection('watchlist').doc(resourceId);
        await watchlistRef.set({
            resourceId: resourceId,
            savedAt: FieldValue.serverTimestamp(),
        });
        revalidatePath('/save');
        revalidatePath('/downloads');
    } catch (error: any) {
        console.error('Error adding to watchlist: ', error);
        throw new Error('Could not save to watchlist.');
    }
}

export async function removeFromWatchlist(userId: string, resourceId: string) {
    if (!userId) {
        throw new Error('User is not authenticated.');
    }
    try {
        const watchlistRef = db.collection('users').doc(userId).collection('watchlist').doc(resourceId);
        await watchlistRef.delete();
        revalidatePath('/save');
        revalidatePath('/downloads');
    } catch (error: any) {
        console.error('Error removing from watchlist: ', error);
        throw new Error('Could not remove from watchlist.');
    }
}

export async function getWatchlist(userId: string): Promise<Resource[]> {
    if (!userId) {
        return [];
    }
    try {
        const watchlistRef = db.collection('users').doc(userId).collection('watchlist');
        const snapshot = await watchlistRef.orderBy('savedAt', 'desc').get();

        if (snapshot.empty) {
            return [];
        }

        const resourceIds = snapshot.docs.map(doc => doc.id);
        
        if (resourceIds.length === 0) {
            return [];
        }
        
        const resourcesSnapshot = await db.collection('resources').where('id', 'in', resourceIds).get();

        const resourcesById = new Map(resourcesSnapshot.docs.map(doc => [doc.id, doc.data()]));

        return resourceIds.map(id => {
             const data = resourcesById.get(id);
             if (!data) return null;

             const createdAt = data.createdAt.toDate().toISOString();
             return {
                id: id,
                ...data,
                createdAt
             } as Resource;
        }).filter((r): r is Resource => r !== null);


    } catch (error) {
        console.error("Error fetching watchlist: ", error);
        return [];
    }
}
