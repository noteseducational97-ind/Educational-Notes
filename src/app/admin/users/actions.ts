
'use server';

import { adminAuth, db } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

// This is the shape of the user object returned by Firebase Admin SDK
type AuthUser = {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    disabled: boolean;
    metadata: {
        creationTime: string;
    };
};

// This is the shape of the user object we want to use in our app
export type AppUser = {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    disabled: boolean;
    creationTime: string;
    isAdmin: boolean;
};

export const listAllUsers = async (): Promise<AppUser[]> => {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const authUsers: AuthUser[] = listUsersResult.users.map(userRecord => userRecord.toJSON() as AuthUser);

    if (authUsers.length === 0) {
      return [];
    }

    const uids = authUsers.map(user => user.uid);
    // Fetch all user documents from Firestore in one go
    const userDocsSnapshot = await db.collection('users').get();
    
    const adminStatusMap = new Map<string, boolean>();
    userDocsSnapshot.forEach(doc => {
      // Ensure the document has data and an isAdmin field
      if (doc.data()?.isAdmin === true) {
        adminStatusMap.set(doc.id, true);
      }
    });

    const allUsers: AppUser[] = authUsers.map(user => {
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
    return [];
  }
};


export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
  try {
    await adminAuth.updateUser(uid, { disabled });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: 'Failed to update user status.' };
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
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user.' };
  }
}

export async function updateUserAdminStatus(uid: string, isAdmin: boolean) {
  try {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({ isAdmin: isAdmin }, { merge: true });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating admin status:', error);
    return { success: false, error: 'Failed to update admin status.' };
  }
}
