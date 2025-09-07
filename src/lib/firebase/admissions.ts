
'use server';

import { db } from '@/lib/firebase/server';
import type { AdmissionForm } from '@/types';
import { revalidatePath } from 'next/cache';

const initialForms: Omit<AdmissionForm, 'id'>[] = [
    {
        title: 'Class 11 Physics',
        description: 'Admission for Class 11 Physics. Science Student',
        status: 'Open',
        totalFees: 15000,
        advanceFees: 5000,
        upiName: 'Pravin Khachane',
        upiId: '9881482416@ybl',
        upiNumber: '9881482416',
    },
    {
        title: 'Class 12 Physics',
        description: 'Admission for Class 12 Physics. Science Student',
        status: 'Open',
        totalFees: 15000,
        advanceFees: 5000,
        upiName: 'Pravin Khachane',
        upiId: '9881482416@ybl',
        upiNumber: '9881482416',
    },
    {
        title: 'Class 11 Chemistry',
        description: 'Admission for Class 11 Chemistry. Science Student',
        status: 'Open',
        totalFees: 15000,
        advanceFees: 5000,
        upiName: 'Mangesh Shete',
        upiId: '9405695457@ybl',
        upiNumber: '9405695457',
    },
    {
        title: 'Class 12 Chemistry',
        description: 'Admission for Class 12 Chemistry. Science Student',
        status: 'Open',
        totalFees: 15000,
        advanceFees: 5000,
        upiName: 'Mangesh Shete',
        upiId: '9405695457@ybl',
        upiNumber: '9405695457',
    },
    {
        title: 'MHT-CET',
        description: 'Admissions Form for MHT-CET Maharashtra',
        status: 'Open',
        totalFees: 0,
        advanceFees: 0,
        upiName: '',
        upiId: '',
        upiNumber: '',
    }
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

    const batch = db.batch();
    initialForms.forEach(form => {
        const slug = createSlug(form.title);
        const docRef = formsCollection.doc(slug);
        batch.set(docRef, { ...form, id: slug });
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
    return snapshot.docs.map(doc => doc.data() as AdmissionForm);
}

export async function getAdmissionFormById(id: string): Promise<AdmissionForm | null> {
    const doc = await db.collection('admissionForms').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return doc.data() as AdmissionForm;
}

export async function updateAdmissionForm(id: string, data: Partial<Omit<AdmissionForm, 'id'>>) {
    await db.collection('admissionForms').doc(id).update(data);
    revalidatePath(`/admin/admission/edit/${id}`);
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
    revalidatePath(`/admission/${id}`);
}
