// app/utils/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // เพิ่มอันนี้

const firebaseConfig = {
  // ... config ของคุณ
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app); // Export storage ออกไปใช้