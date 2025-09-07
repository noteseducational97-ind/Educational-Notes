
'use server';

import { db } from '@/lib/firebase/server';
import type { AdmissionForm } from '@/types';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';


const initialForms: Omit<AdmissionForm, 'id' | 'createdAt'>[] = [
    // All forms removed as per user request
];

const createSlug = (title: string, year: string) => {
  const yearSuffix = year.replace(/[^0-9]/g, '');
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '') + `-${yearSuffix}`;
};

export async function addAdmissionForm(data: Omit<AdmissionForm, 'id' | 'createdAt'>) {
    const slug = createSlug(data.title, data.year);
    const docRef = db.collection('admissionForms').doc(slug);
    
    await docRef.set({
        ...data,
        id: slug,
        createdAt: new Date(),
    });

    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}

export async function getAdmissionForms(): Promise<AdmissionForm[]> {
    const snapshot = await db.collection('admissionForms').orderBy('createdAt', 'desc').get();
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
