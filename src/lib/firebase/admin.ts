
'use server';

import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import { db } from './server';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
  throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.');
}

// Manually replace escaped newlines in the private key
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}


let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApp();
}

export const adminAuth = getAuth(app);

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
