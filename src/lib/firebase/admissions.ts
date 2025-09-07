
'use server';

import { db } from '@/lib/firebase/server';
import type { AdmissionForm } from '@/types';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';


const initialForms: Omit<AdmissionForm, 'id'>[] = [
    // All forms removed as per user request
];

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export async function seedAdmissionForms() {
    const formsCollection = db.collection('admissionForms');
    const snapshot = await formsCollection.limit(1).get();

    if (!snapshot.empty) {
        console.log('Admission forms collection is not empty. Skipping seed.');
        return;
    }
    
    if (initialForms.length === 0) {
        console.log('No initial forms to seed.');
        return;
    }

    const batch = db.batch();
    initialForms.forEach(form => {
        const slug = createSlug(form.title);
        const docRef = formsCollection.doc(slug);
        const { createdAt, ...restOfForm } = form; // Destructure to handle date separately
        batch.set(docRef, { ...restOfForm, id: slug, createdAt: new Date(createdAt) }); // Store as Date object
    });

    await batch.commit();
    console.log('Successfully seeded admission forms.');
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}


export async function getAdmissionForms(): Promise<AdmissionForm[]> {
    const snapshot = await db.collection('admissionForms').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return {
            ...data,
            id: doc.id,
            createdAt,
        } as AdmissionForm;
    });
}

export async function getAdmissionFormById(id: string): Promise<AdmissionForm | null> {
    const doc = await db.collection('admissionForms').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data();
    if (!data) return null;

    const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
    
    return {
        ...data,
        id: doc.id,
        createdAt,
    } as AdmissionForm;
}

export async function updateAdmissionForm(id: string, data: Partial<Omit<AdmissionForm, 'id' | 'createdAt'>>) {
    await db.collection('admissionForms').doc(id).update({
        ...data,
        updatedAt: new Date(),
    });
    revalidatePath(`/admin/admission/edit/${id}`);
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
    revalidatePath(`/admission/${id}`);
}
