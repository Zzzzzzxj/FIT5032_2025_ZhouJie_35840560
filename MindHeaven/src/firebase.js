// src/firebase.js
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

// 用 .env（Vite 变量必须 VITE_ 前缀）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// —— 按名导出你在 LoginModal.vue 用到的函数 ——

// 监听登录态（在 App.vue 里用）
export const listenAuth = (cb) => onAuthStateChanged(auth, cb)

// 邮箱登录 / 注册
export const emailSignIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const emailSignUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

// Google 登录
export const googleSignIn = () =>
  signInWithPopup(auth, new GoogleAuthProvider())

// 登出
export const logout = () => signOut(auth)
