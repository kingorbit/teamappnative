// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);