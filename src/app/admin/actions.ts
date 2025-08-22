
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.array(z.string()).nonempty({ message: 'Select at least one category.' }),
  subject: z.array(z.string()).nonempty({ message: 'Select at least one subject.' }),
  class: z.string().optional(),
  stream: z.array(z.string()).nonempty({ message: 'Select at least one stream.' }),
  imageUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  isComingSoon: z.boolean().default(false),
  visibility: z.enum(['public', 'private']).default('public'),
}).superRefine((data, ctx) => {
    if (!data.isComingSoon) {
        if (!data.imageUrl || !z.string().url().safeParse(data.imageUrl).success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Image URL is required and must be a valid URL when resource is not "Coming Soon".',
                path: ['imageUrl'],
            });
        }
        if (!data.pdfUrl || !z.string().url().safeParse(data.pdfUrl).success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'PDF URL is required and must be a valid URL when resource is not "Coming Soon".',
                path: ['pdfUrl'],
            });
        }
    }
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
      errors: validatedFields.error.flatten().fieldErrors,
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

    revalidatePath('/admin/uploaded-resources');
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
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const resourceRef = db.collection('resources').doc(id);

  try {
    await resourceRef.update({
      ...validatedFields.data,
    });

    revalidatePath('/admin/uploaded-resources');
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

    revalidatePath('/admin/uploaded-resources');
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
