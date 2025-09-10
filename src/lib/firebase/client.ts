
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCm8CWW2NS1aGQII9EwMAfBDBxWh4mlddo",
  authDomain: "authzen-698pc.firebaseapp.com",
  projectId: "authzen-698pc",
  storageBucket: "authzen-698pc.firebasestorage.app",
  messagingSenderId: "645500335752",
  appId: "1:645500335752:web:de594eb8789542776d913d"
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
