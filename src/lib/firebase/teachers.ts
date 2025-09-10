
'use server';

import { db } from '@/lib/firebase/server';
import type { Teacher } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export async function addTeacher(data: Omit<Teacher, 'id' | 'createdAt'>): Promise<void> {
    const slug = createSlug(data.name);
    const teacherRef = db.collection('teachers').doc(slug);
    await teacherRef.set({
        ...data,
        id: slug,
        createdAt: FieldValue.serverTimestamp(),
    });
}

export async function getTeachers(): Promise<Teacher[]> {
    const snapshot = await db.collection('teachers').orderBy('name').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
        } as Teacher
    });
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
    const doc = await db.collection('teachers').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data();
    if (!data) return null;

    return { 
        id: doc.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
    } as Teacher;
}

export async function updateTeacher(id: string, data: Partial<Omit<Teacher, 'id' | 'createdAt'>>): Promise<void> {
    const teacherRef = db.collection('teachers').doc(id);
    await teacherRef.update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteTeacher(id: string): Promise<void> {
    await db.collection('teachers').doc(id).delete();
}
