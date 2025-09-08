
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';
import { adminAuth } from '@/lib/firebase/admin';

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  category: z.array(z.string()).nonempty({ message: 'Select at least one category.' }),
  subject: z.array(z.string()).nonempty({ message: 'Select at least one subject.' }),
  stream: z.array(z.string()).nonempty({ message: 'Select at least one stream.' }),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  pdfUrl: z.string().optional(),
  viewPdfUrl: z.string().url('A valid view URL for the PDF is required.'),
  isComingSoon: z.boolean().default(false),
  visibility: z.enum(['private', 'public']).default('public'),
}).superRefine((data, ctx) => {
    if (!data.isComingSoon) {
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
  
  const { ...restOfData } = validatedFields.data;

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
      ...restOfData,
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
  
  const { ...restOfData } = validatedFields.data;

  const resourceRef = db.collection('resources').doc(id);

  try {
    await resourceRef.update({
      ...restOfData,
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
    // Delete the resource document
    await db.collection('resources').doc(id).delete();

    // After deleting the resource, attempt to remove it from watchlists.
    // This is a secondary action and should not block the main deletion if it fails.
    try {
      const watchlistSnapshot = await db.collectionGroup('watchlist').where('resourceId', '==', id).get();
      if (!watchlistSnapshot.empty) {
          const batch = db.batch();
          watchlistSnapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
          });
          await batch.commit();
      }
    } catch (watchlistError) {
      // Log the error but don't fail the entire operation.
      // This might happen if the required index for collectionGroup query is not created.
      console.warn(`Could not clean up watchlists for deleted resource ${id}:`, watchlistError);
    }
    
    // Revalidate paths to update the UI
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

export async function getAdminStats() {
    try {
        const usersPromise = adminAuth.listUsers();
        const resourcesPromise = db.collection('resources').count().get();

        const [usersResult, resourcesSnapshot] = await Promise.all([usersPromise, resourcesPromise]);

        return {
            userCount: usersResult.users.length,
            resourceCount: resourcesSnapshot.data().count,
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { userCount: 0, resourceCount: 0 };
    }
}
