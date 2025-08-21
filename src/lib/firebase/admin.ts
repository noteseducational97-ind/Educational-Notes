'use server';

import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Correctly parse the JSON string and the private key within it
const serviceAccount = JSON.parse(serviceAccountString);
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
