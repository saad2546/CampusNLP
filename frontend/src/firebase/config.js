// Firebase Web App Configuration
// A.P. Shah Institute of Technology — Intelligent Complaint Analyzer
// This is the PUBLIC web config (safe to include in frontend)
// NEVER put the Admin SDK service account JSON here.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDsBDQ3fDKvD1g-bAPj9U9yuNV9fgWGgC0",
  authDomain: "complaints-85e19.firebaseapp.com",
  projectId: "complaints-85e19",
  storageBucket: "complaints-85e19.firebasestorage.app",
  messagingSenderId: "207339050200",
  appId: "1:207339050200:web:2ed18d34b328e05e1cb3ad",
  measurementId: "G-HF5VXYMD3Z"
};

const app = initializeApp(firebaseConfig);

export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const storage   = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
