'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/server'; // Use server-side db
import { revalidatePath } from 'next/cache';

type Resource = {
  title: string;
  description: string;
  url: string;
};

export async function addResource(resource: Resource) {
  try {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resource,
      createdAt: serverTimestamp(),
    });
    // This will help in case we want to show the resources on the admin page
    // and want to see the new one immediately.
    revalidatePath('/admin');
    return { id: docRef.id, ...resource };
  } catch (error: any) {
    console.error('Error adding resource to Firestore: ', error);
    throw new Error('Could not add resource.');
  }
}
