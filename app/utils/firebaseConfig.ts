import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // *** ต้องมีบรรทัดนี้ ***
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, 
};

// เช็คว่าเคยมี App รันอยู่หรือยัง ถ้าไม่มีให้สร้างใหม่
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const database = getDatabase(app);
export const storage = getStorage(app);