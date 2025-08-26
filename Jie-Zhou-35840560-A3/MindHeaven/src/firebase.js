import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth'
console.log('API KEY =>', import.meta.env.VITE_FIREBASE_API_KEY)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)


export const listenAuth = (cb) => onAuthStateChanged(auth, cb)

export const emailSignIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const emailSignUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

// Google log in
export const googleSignIn = () =>
  signInWithPopup(auth, new GoogleAuthProvider())

// log out
export const logout = () => signOut(auth)
