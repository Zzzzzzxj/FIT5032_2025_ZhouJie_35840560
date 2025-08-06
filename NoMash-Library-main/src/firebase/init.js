// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCH2LWj2a7lssBwqPtt1t5YDxuTFlCHQWg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lab07-b39ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lab07-b39ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lab07-b39ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "796550631396",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:796550631396:web:3e771bdc9cf21bc91cc1f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore instance as default
export default db;