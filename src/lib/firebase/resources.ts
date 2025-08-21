
'use server';

import { collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/server'; // Use server-side db
import { revalidatePath } from 'next/cache';
import type { Resource as ResourceType } from '@/types';

export type Resource = ResourceType & {
  createdAt: string;
};

// The type for the function argument should not have id or createdAt
export type AddResourceData = Omit<Resource, 'id' | 'createdAt'>;

export async function addResource(resource: AddResourceData) {
  try {
    await addDoc(collection(db, 'resources'), {
      ...resource,
      createdAt: new Date(),
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
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.warn("Firebase service account key is not set. Skipping resource fetch.");
            return [];
        }
        const resourcesCollection = collection(db, 'resources');
        const q = query(resourcesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            let createdAtString: string;
            if (createdAt instanceof Timestamp) {
                createdAtString = createdAt.toDate().toISOString();
            } else if (createdAt && typeof createdAt.toDate === 'function') {
                createdAtString = createdAt.toDate().toISOString();
            } else if (typeof createdAt === 'string') {
                createdAtString = createdAt;
            } else if (createdAt) {
                 // Fallback for other potential date representations
                createdAtString = new Date(createdAt).toISOString();
            } else {
                createdAtString = new Date().toISOString();
            }

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
                createdAt: createdAtString,
            } as Resource;
        });
    } catch (error) {
        console.error("Error fetching resources: ", error);
        return [];
    }
}
