'use server';

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();

export const listAllUsers = async () => {
  try {
    const userRecords = await adminAuth.listUsers();
    return userRecords.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: new Date(user.metadata.creationTime).toLocaleDateString(),
    }));
  } catch (error) {
    console.error('Error listing users:', error);
    // Return an empty array or re-throw the error, depending on desired error handling
    return [];
  }
};
