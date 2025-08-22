
'use server';

import { db } from '@/lib/firebase/server'; // Use server-side db
import { revalidatePath } from 'next/cache';
import type { Resource as ResourceType } from '@/types';
import { FieldValue, Timestamp, FieldPath } from 'firebase-admin/firestore';

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

export async function getResources(options: { includePrivate?: boolean, publicOnly?: boolean } = {}): Promise<Resource[]> {
    try {
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('resources');
        
        if (options.publicOnly) {
            // DEPRECATED: This path is for non-logged-in users, but new logic covers it.
            query = query.where('visibility', '==', 'public');
        } else if (!options.includePrivate) {
            // Default behavior for non-logged-in users: only public resources
            query = query.where('visibility', '==', 'public');
        }
        // If includePrivate is true, we don't add a where clause for visibility,
        // so we fetch all resources (public and private). This is for admins.
        // Let's refine this to filter on the server for logged-in users.
        if (options.includePrivate) {
            // Logged-in user gets public and private
            query = query.where('visibility', 'in', ['public', 'private']);
        }


        const querySnapshot = await query.orderBy('createdAt', 'desc').get();
        
        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

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
                viewPdfUrl: data.viewPdfUrl,
                pdfUrl: data.pdfUrl,
                createdAt: createdAt,
                isComingSoon: data.isComingSoon || false,
                visibility: data.visibility || 'public',
            } as Resource;
        });
    } catch (error) {
        console.error("Error fetching resources: ", error);
        return [];
    }
}

export async function getResourceById(id: string): Promise<Resource | null> {
    try {
        const docSnap = await db.collection('resources').doc(id).get();

        if (!docSnap.exists) {
            console.log('No such document in resources!');
            return null;
        }

        const data = docSnap.data();
        if (!data) return null;
        
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

        const resource: Resource = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            content: data.content,
            category: data.category,
            subject: data.subject,
            class: data.class,
            stream: data.stream,
            imageUrl: data.imageUrl,
            viewPdfUrl: data.viewPdfUrl,
            pdfUrl: data.pdfUrl,
            createdAt: createdAt,
            isComingSoon: data.isComingSoon || false,
            visibility: data.visibility || 'public',
        };

        return resource;

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

        // A user's watchlist should contain all their saved items, regardless of visibility.
        // We will fetch all of them here, and the client will be responsible for filtering
        // based on the user's role (admin vs regular user).
        const allResources: Resource[] = [];
        const batchSize = 30; // Firestore 'in' query limit
        for (let i = 0; i < resourceIds.length; i += batchSize) {
            const batchIds = resourceIds.slice(i, i + batchSize);
            if (batchIds.length === 0) continue;

            const resourcesSnapshot = await db.collection('resources').where(FieldPath.documentId(), 'in', batchIds).get();
            const resourcesById = new Map(resourcesSnapshot.docs.map(doc => [doc.id, doc.data()]));
            
            const batchResources = batchIds.map(id => {
                const resourceData = resourcesById.get(id);
                if (!resourceData) return null;
                
                const createdAt = (resourceData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

                return {
                    id: id,
                    title: resourceData.title,
                    description: resourceData.description,
                    content: resourceData.content,
                    category: resourceData.category,
                    subject: resourceData.subject,
                    class: resourceData.class,
                    stream: resourceData.stream,
                    imageUrl: resourceData.imageUrl,
                    viewPdfUrl: resourceData.viewPdfUrl,
                    pdfUrl: resourceData.pdfUrl,
                    createdAt: createdAt,
                    isComingSoon: resourceData.isComingSoon || false,
                     visibility: resourceData.visibility || 'public',
                } as Resource;
            }).filter((item): item is Resource => item !== null);

            allResources.push(...batchResources);
        }

        const savedOrder = new Map(snapshot.docs.map((doc, index) => [doc.id, index]));
        allResources.sort((a, b) => (savedOrder.get(a.id) ?? 0) - (savedOrder.get(b.id) ?? 0));
        
        return allResources;

    } catch (error) {
        console.error("Error fetching watchlist: ", error);
        return [];
    }
}
