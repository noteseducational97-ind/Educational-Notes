
'use server';

import { adminAuth, db } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

export const listAllUsers = async () => {
  try {
    const userRecords = await adminAuth.listUsers();
    
    const userPromises = userRecords.users.map(async (user) => {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();
      const isAdmin = userDoc.exists && userDoc.data()?.isAdmin === true;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: new Date(user.metadata.creationTime).toLocaleDateString(),
        isAdmin: isAdmin,
      };
    });

    const allUsers = await Promise.all(userPromises);
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
    revalidatePath('/admin/users/list/admins');
    revalidatePath('/admin/users/list/regular');
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
    revalidatePath('/admin/users/list/admins');
    revalidatePath('/admin/users/list/regular');
    revalidatePath('/admin'); // To update stats
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user.');
  }
}

export async function updateUserAdminStatus(uid: string, isAdmin: boolean) {
  try {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({ isAdmin: isAdmin }, { merge: true });
    revalidatePath('/admin/users');
    revalidatePath('/admin/users/list/admins');
    revalidatePath('/admin/users/list/regular');
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw new Error('Failed to update admin status.');
  }
}
