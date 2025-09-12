
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCXs29ewiUFUbbdbdS7EX3BGdlpFdZMB8U",
  authDomain: "educational-notes97.firebaseapp.com",
  projectId: "educational-notes97",
  storageBucket: "educational-notes97.appspot.com",
  messagingSenderId: "1073752372395",
  appId: "1:1073752372395:web:72bc8c94978f2ff32cb3ee",
  measurementId: "G-Z8CD6PBYZZ"
};

// Check that all required environment variables are set
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error(
    'Firebase environment variables are not set. Please check your .env.local file or environment configuration.'
  );
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
