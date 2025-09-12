
// This file is intended for server-side use only.
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

// Explicitly handle the private_key format
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app: App = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id, // Explicitly set project ID
    });

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
