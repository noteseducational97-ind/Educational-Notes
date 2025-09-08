
'use server';

import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';

export const listAllUsers = async () => {
  try {
    const userRecords = await adminAuth.listUsers();
    const allUsers = userRecords.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: new Date(user.metadata.creationTime).toLocaleDateString(),
    }));
    return allUsers;
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
};

export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
  try {
    await adminAuth.updateUser(uid, { disabled });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status.');
  }
}

export async function deleteUser(uid: string) {
  try {
    // Delete from Auth
    await adminAuth.deleteUser(uid);
    
    // Delete from Firestore
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.delete();

    revalidatePath('/admin/users');
    revalidatePath('/admin'); // To update stats
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user.');
  }
}
