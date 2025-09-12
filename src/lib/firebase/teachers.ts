
'use server';

import { db } from '@/lib/firebase/admin';
import type { Teacher } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function addTeacher(data: Omit<Teacher, 'id' | 'createdAt'>): Promise<void> {
    const teacherRef = db.collection('teachers').doc();
    await teacherRef.set({
        ...data,
        id: teacherRef.id,
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

export async function getTeacherById(teacherId: string): Promise<Teacher | null> {
    const doc = await db.collection('teachers').doc(teacherId).get();
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

export async function updateTeacher(teacherId: string, data: Partial<Omit<Teacher, 'id' | 'createdAt'>>): Promise<void> {
    const teacherRef = db.collection('teachers').doc(teacherId);
    await teacherRef.update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteTeacher(id: string): Promise<void> {
    await db.collection('teachers').doc(id).delete();
}
