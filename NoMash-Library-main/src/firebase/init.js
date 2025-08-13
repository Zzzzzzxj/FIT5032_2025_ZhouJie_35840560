// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH2LWj2a7lssBwqPtt1t5YDxuTFlCHQWg",
  authDomain: "lab07-b39ee.firebaseapp.com",
  projectId: "lab07-b39ee",
  storageBucket: "lab07-b39ee.firebasestorage.app",
  messagingSenderId: "796550631396",
  appId: "1:796550631396:web:3e771bdc9cf21bc91cc1f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore instance as default
export default db;