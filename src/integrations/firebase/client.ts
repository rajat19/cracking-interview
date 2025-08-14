import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC7U1Z5-wQO9gC4XLPxFD05Ro78x8r66ME",
    authDomain: "interview-prep-rajat19.firebaseapp.com",
    projectId: "interview-prep-rajat19",
    storageBucket: "interview-prep-rajat19.firebasestorage.app",
    messagingSenderId: "914353254193",
    appId: "1:914353254193:web:e5fc4f1cbd1a7dfd350a10",
    measurementId: "G-ELKGVNWZQK"
};

const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
