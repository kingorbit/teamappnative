import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPV3-30Zc9BKM_bl8_k6llOo02CAULwDU",
  authDomain: "teamappnative.firebaseapp.com",
  projectId: "teamappnative",
  storageBucket: "teamappnative.appspot.com",
  messagingSenderId: "1092485530008",
  appId: "1:1092485530008:web:f59e5a12aa14d95dc66bed",
  measurementId: "G-XYLGH00G40"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app); 
