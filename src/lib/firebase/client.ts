
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDk3U7INhihb-IO1BkA9iyWPsXRPfMRgDo",
  authDomain: "educational-notesdup.firebaseapp.com",
  projectId: "educational-notesdup",
  storageBucket: "educational-notesdup.firebasestorage.app",
  messagingSenderId: "768328933218",
  appId: "1:768328933218:web:61c75bf8269acab41a963b"
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
