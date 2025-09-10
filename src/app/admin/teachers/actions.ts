
'use server';

import { addTeacher, deleteTeacher, updateTeacher } from '@/lib/firebase/teachers';
import type { Teacher } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addTeacherAction(data: Omit<Teacher, 'id'>) {
    try {
        await addTeacher(data);
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to add teacher.' };
    }
}

export async function updateTeacherAction(id: string, data: Omit<Teacher, 'id'>) {
    try {
        await updateTeacher(id, data);
        revalidatePath('/admin/teachers');
        revalidatePath(`/admin/teachers/edit/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update teacher.' };
    }
}

export async function deleteTeacherAction(id: string) {
    try {
        await deleteTeacher(id);
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete teacher.' };
    }
}
