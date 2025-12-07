import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx_A8WB1rbJlsKFiMUlDffWkOvqfke3GU",
  authDomain: "student-productivity-hub-a2329.firebaseapp.com",
  projectId: "student-productivity-hub-a2329",
  storageBucket: "student-productivity-hub-a2329.firebasestorage.app",
  messagingSenderId: "575013213312",
  appId: "1:575013213312:web:f4eba7de19d1c94222c265",
  measurementId: "G-MFR87MNWK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
