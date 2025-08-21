'use server';

import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/server'; // Use server-side db
import { revalidatePath } from 'next/cache';

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: Date;
};

export async function addResource(resource: Omit<Resource, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'resources'), {
      ...resource,
      createdAt: serverTimestamp(),
    });
    // This will help in case we want to show the resources on the admin page
    // and want to see the new one immediately.
    revalidatePath('/admin');
    revalidatePath('/downloads'); // Invalidate downloads page to show new resource
  } catch (error: any) {
    console.error('Error adding resource to Firestore: ', error);
    throw new Error('Could not add resource.');
  }
}

export async function getResources(): Promise<Resource[]> {
    try {
        const resourcesCollection = collection(db, 'resources');
        const q = query(resourcesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                url: data.url,
                // Convert Firestore Timestamp to a serializable format (ISO string)
                createdAt: data.createdAt.toDate().toISOString(),
            };
        }) as Resource[];
    } catch (error) {
        console.error("Error fetching resources: ", error);
        return [];
    }
}
