
'use server';

import { adminAuth, db } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

export const listAllUsers = async () => {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const uids = listUsersResult.users.map(user => user.uid);

    if (uids.length === 0) {
      return [];
    }

    const userDocsSnapshot = await db.collection('users').where('uid', 'in', uids).get();
    const adminStatusMap = new Map<string, boolean>();
    userDocsSnapshot.forEach(doc => {
      adminStatusMap.set(doc.id, doc.data()?.isAdmin === true);
    });

    const allUsers = listUsersResult.users.map(user => {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: new Date(user.metadata.creationTime).toLocaleDateString(),
        isAdmin: adminStatusMap.get(user.uid) || false,
      };
    });

    return allUsers;

  } catch (error) {
    console.error('Error listing users:', error);
    // Return empty array or throw a more specific error
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

export async function updateUserAdminStatus(uid: string, isAdmin: boolean) {
  try {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({ isAdmin: isAdmin }, { merge: true });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw new Error('Failed to update admin status.');
  }
}
