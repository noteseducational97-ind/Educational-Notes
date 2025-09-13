
'use server';

import { db } from '@/lib/firebase/admin';
import type { Teacher } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const toISOString = (timestamp: Timestamp | string | undefined): string | undefined => {
    if (!timestamp) return undefined;
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
    return undefined;
};

const transformGoogleDriveUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes("drive.google.com/file/d/")) {
        const fileId = url.split('/d/')[1].split('/')[0];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
};


export async function addTeacher(data: Omit<Teacher, 'id' | 'createdAt'>): Promise<void> {
    const teacherRef = db.collection('teachers').doc();
    const transformedPhotoUrl = transformGoogleDriveUrl(data.photoUrl);
    const photoUrl = transformedPhotoUrl || `https://avatar.iran.liara.run/public/boy?username=${teacherRef.id}`;
    
    await teacherRef.set({
        ...data,
        photoUrl,
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
            photoUrl: transformGoogleDriveUrl(data.photoUrl),
            createdAt: toISOString(data.createdAt) || new Date().toISOString(),
            updatedAt: toISOString(data.updatedAt),
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
        photoUrl: transformGoogleDriveUrl(data.photoUrl),
        createdAt: toISOString(data.createdAt) || new Date().toISOString(),
        updatedAt: toISOString(data.updatedAt),
    } as Teacher;
}

export async function updateTeacher(teacherId: string, data: Partial<Omit<Teacher, 'id' | 'createdAt'>>): Promise<void> {
    const teacherRef = db.collection('teachers').doc(teacherId);
    const transformedPhotoUrl = transformGoogleDriveUrl(data.photoUrl);
    const photoUrl = transformedPhotoUrl || `https://avatar.iran.liara.run/public/boy?username=${teacherId}`;

    await teacherRef.update({
        ...data,
        photoUrl,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteTeacher(id: string): Promise<void> {
    await db.collection('teachers').doc(id).delete();
}
