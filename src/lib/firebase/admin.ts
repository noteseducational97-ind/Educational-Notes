
'use server';

import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

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

const adminAuth = getAuth(app);

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
    // Exclude the admin user from this list
    return allUsers.filter(user => user.email !== 'noteseducational97@gmail.com');
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
};

export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
  try {
    await adminAuth.updateUser(uid, { disabled });
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status.');
  }
}

export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user.');
  }
}
