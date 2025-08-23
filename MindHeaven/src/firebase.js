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

// ✅ 建议把密钥放到 .env 文件中（Vite 变量必须以 VITE_ 开头）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // 可选：storageBucket、messagingSenderId ...
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// —— 常用封装 ——

// 监听登录状态变化（在 App.vue 中调用一次即可）
export const listenAuth = (callback) => onAuthStateChanged(auth, callback)

// 邮箱登录 / 注册
export const emailSignIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const emailSignUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

// Google 登录（可选）
export const googleSignIn = () =>
  signInWithPopup(auth, new GoogleAuthProvider())

// 登出
export const logout = () => signOut(auth)
