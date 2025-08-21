
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.enum(['All', 'Notes', 'PYQ', 'Syllabus']),
  subject: z.enum(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science']),
  class: z.enum(['class9', 'class10', 'class11', 'class12']),
  stream: z.enum(['All', 'Science', 'Commerce', 'Arts']),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  pdfUrl: z.string().url('Please enter a valid PDF URL.').optional().or(z.literal('')),
  downloadUrl: z.string().url('Please enter a valid download URL.').optional().or(z.literal('')),
});

type AddResourceInput = z.infer<typeof FormSchema>;

// Slug generation utility
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

    // Revalidate paths to show the new resource immediately
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
