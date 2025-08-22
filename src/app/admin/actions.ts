
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.enum(['Notes', 'PYQ', 'Syllabus']),
  subject: z.enum(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science']),
  class: z.enum(['class9', 'class10', 'class11', 'class12']),
  stream: z.enum(['All', 'Science', 'Commerce', 'Arts']),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  pdfUrl: z.string().url('Please enter a valid PDF URL.').optional().or(z.literal('')),
  downloadUrl: z.string().url('Please enter a valid download URL.').optional().or(z.literal('')),
});

type AddResourceInput = z.infer<typeof FormSchema>;

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export async function addResourceAction(data: AddResourceInput) {
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid fields. Please check the form and try again.',
    };
  }

  const slug = createSlug(validatedFields.data.title);
  const resourceRef = db.collection('resources').doc(slug);

  try {
    const doc = await resourceRef.get();
    if (doc.exists) {
      return {
        success: false,
        error: `A resource with the title "${validatedFields.data.title}" already exists. Please choose a different title.`,
      };
    }

    await resourceRef.set({
      ...validatedFields.data,
      id: slug,
      createdAt: new Date(),
    });

    revalidatePath('/admin');
    revalidatePath('/downloads');
    revalidatePath(`/resources/${slug}`);

    return { success: true, id: slug };
  } catch (error) {
    console.error('Error adding resource to Firestore: ', error);
    return {
      success: false,
      error: 'Something went wrong on the server. Could not add the resource.',
    };
  }
}

export async function updateResourceAction(id: string, data: AddResourceInput) {
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid fields. Please check the form and try again.',
    };
  }

  const resourceRef = db.collection('resources').doc(id);

  try {
    await resourceRef.update({
      ...validatedFields.data,
    });

    revalidatePath('/admin');
    revalidatePath('/downloads');
    revalidatePath(`/resources/${id}`);

    return { success: true, id: id };
  } catch (error) {
    console.error('Error updating resource in Firestore: ', error);
    return {
      success: false,
      error: 'Something went wrong on the server. Could not update the resource.',
    };
  }
}

export async function deleteResourceAction(id: string) {
  if (!id) {
    return { success: false, error: 'Resource ID is required.' };
  }
  
  try {
    await db.collection('resources').doc(id).delete();
    
    // Also remove from users' watchlists (optional but good practice)
    const watchlistQuery = await db.collectionGroup('watchlist').where('resourceId', '==', id).get();
    const batch = db.batch();
    watchlistQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    revalidatePath('/admin');
    revalidatePath('/downloads');
    revalidatePath('/save');

    return { success: true };
  } catch (error) {
    console.error('Error deleting resource from Firestore: ', error);
    return {
      success: false,
      error: 'Something went wrong on the server. Could not delete the resource.',
    };
  }
}
