
'use server';

import { db } from '@/lib/firebase/server';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';


const transformGoogleDriveUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes("drive.google.com/file/d/")) {
        const fileId = url.split('/d/')[1].split('/')[0];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
};

export async function addAdmissionForm(data: Omit<AdmissionForm, 'id' | 'createdAt'>) {
    const docRef = db.collection('admissionForms').doc();
    
    const transformedImageUrl = transformGoogleDriveUrl(data.imageUrl);

    await docRef.set({
        ...data,
        imageUrl: transformedImageUrl,
        id: docRef.id,
        createdAt: new Date(),
    });

    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}

export async function getAdmissionForms(): Promise<AdmissionForm[]> {
    try {
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
    } catch (error) {
        console.error("Failed to fetch admission forms:", error);
        return [];
    }
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
    const transformedImageUrl = transformGoogleDriveUrl(data.imageUrl);
    await db.collection('admissionForms').doc(id).update({
        ...data,
        imageUrl: transformedImageUrl,
        updatedAt: new Date(),
    });
    revalidatePath(`/admin/admission/edit/${id}`);
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
    revalidatePath(`/admission/${id}`);
}

export async function deleteAdmissionForm(id: string) {
    if (!id) {
        throw new Error('Form ID is required for deletion.');
    }
    await db.collection('admissionForms').doc(id).delete();
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}

export async function submitAdmissionApplication(formId: string, applicationData: any) {
  if (!formId) {
    throw new Error('Form ID is required.');
  }
  const applicationRef = db.collection('admissionForms').doc(formId).collection('applications').doc();
  await applicationRef.set({
    ...applicationData,
    submittedAt: new Date(),
    id: applicationRef.id,
  });
}

export async function getApplicationsForForm(formId: string): Promise<AdmissionApplication[]> {
    if (!formId) {
        return [];
    }
    const snapshot = await db.collection('admissionForms').doc(formId).collection('applications')
        .orderBy('submittedAt', 'desc').get();
    
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const submittedAt = (data.submittedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return {
            ...data,
            id: doc.id,
            submittedAt,
        } as AdmissionApplication;
    });
}
