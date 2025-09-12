
'use server';

import { db } from '@/lib/firebase/admin'; // Use server-side db
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

export async function getResources(options: { includePrivate?: boolean, isAdmin?: boolean } = { includePrivate: false, isAdmin: false }): Promise<Resource[]> {
    try {
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('resources').orderBy('createdAt', 'desc');
        
        const querySnapshot = await query.get();
        
        if (querySnapshot.empty) {
            return [];
        }

        const allDocs = querySnapshot.docs;
        let visibleResources;

        if (options.isAdmin) {
            // Admins see everything
            visibleResources = allDocs;
        } else {
            // Filter for public/logged-in users
            visibleResources = allDocs.filter(doc => {
                const data = doc.data();
                if (data.isComingSoon) {
                    return false;
                }
                if (data.visibility === 'public') {
                    return true;
                }
                if (options.includePrivate && data.visibility === 'private') {
                    return true; // Show private to logged-in users
                }
                return false;
            });
        }


        return visibleResources.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

            return {
                id: doc.id,
                title: data.title,
                content: data.content,
                category: data.category,
                subject: data.subject,
                class: data.class,
                stream: data.stream,
                imageUrl: data.imageUrl,
                pdfUrl: data.pdfUrl,
                viewPdfUrl: data.viewPdfUrl,
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
            content: data.content,
            category: data.category,
            subject: data.subject,
            class: data.class,
            stream: data.stream,
            imageUrl: data.imageUrl,
            pdfUrl: data.pdfUrl,
            viewPdfUrl: data.viewPdfUrl,
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


export async function addToWatchlist(userId: string | undefined, resourceId: string) {
    if (!userId) {
        throw new Error('User ID is required to add to watchlist.');
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
        console.error('Error adding to Firestore watchlist: ', error);
        throw new Error('Could not save to your cloud watchlist.');
    }
}


export async function syncGuestWatchlist(userId: string, guestResourceIds: string[]) {
    if (!userId || !guestResourceIds || guestResourceIds.length === 0) {
        return;
    }
    try {
        const batch = db.batch();
        guestResourceIds.forEach(resourceId => {
            const watchlistRef = db.collection('users').doc(userId).collection('watchlist').doc(resourceId);
            batch.set(watchlistRef, {
                resourceId: resourceId,
                savedAt: FieldValue.serverTimestamp(),
            }, { merge: true }); // Use merge to not overwrite existing savedAt time if it's already there
        });
        await batch.commit();
        revalidatePath('/save');
    } catch (error) {
        console.error('Error syncing guest watchlist to Firestore:', error);
        // Don't throw an error to the client, just log it. Syncing is a background task.
    }
}


export async function removeFromWatchlist(userId: string | undefined, resourceId: string) {
    if (!userId) {
        throw new Error('User ID is required to remove from watchlist.');
    }
    try {
        const watchlistRef = db.collection('users').doc(userId).collection('watchlist').doc(resourceId);
        await watchlistRef.delete();
        revalidatePath('/save');
        revalidatePath('/downloads');
    } catch (error: any) {
        console.error('Error removing from Firestore watchlist: ', error);
        throw new Error('Could not remove from your cloud watchlist.');
    }
}

export async function getWatchlist(userId?: string, guestResourceIds?: string[]): Promise<Resource[]> {
    let resourceIds: string[] = [];
    let savedOrderMap = new Map<string, number>();

    if (userId) {
        try {
            const watchlistRef = db.collection('users').doc(userId).collection('watchlist');
            const snapshot = await watchlistRef.orderBy('savedAt', 'desc').get();
            if (!snapshot.empty) {
                resourceIds = snapshot.docs.map(doc => doc.id);
                snapshot.docs.forEach((doc, index) => savedOrderMap.set(doc.id, index));
            }
        } catch (error) {
            console.error("Error fetching Firestore watchlist: ", error);
            return [];
        }
    } else if (guestResourceIds) {
        resourceIds = guestResourceIds;
    }
    
    if (resourceIds.length === 0) {
        return [];
    }

    try {
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
                    content: resourceData.content,
                    category: resourceData.category,
                    subject: resourceData.subject,
                    class: resourceData.class,
                    stream: resourceData.stream,
                    imageUrl: resourceData.imageUrl,
                    pdfUrl: resourceData.pdfUrl,
                    viewPdfUrl: resourceData.viewPdfUrl,
                    createdAt: createdAt,
                    isComingSoon: resourceData.isComingSoon || false,
                     visibility: resourceData.visibility || 'public',
                } as Resource;
            }).filter((item): item is Resource => item !== null);

            allResources.push(...batchResources);
        }

        if (userId) {
             // Sort based on Firestore save order
            allResources.sort((a, b) => (savedOrderMap.get(a.id) ?? 0) - (savedOrderMap.get(b.id) ?? 0));
        } else {
             // For guests, we can just reverse to show most recently added first
             allResources.reverse();
        }
        
        const filteredWatchlist = allResources.filter(item => !item.isComingSoon);

        return filteredWatchlist;

    } catch (error) {
        console.error("Error fetching resources for watchlist: ", error);
        return [];
    }
}
