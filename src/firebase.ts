import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDSMIU3u76126WPFp4NDfPBu2t6bYsC8IE",
  authDomain: "mkdom2x2.firebaseapp.com",
  databaseURL: "https://mkdom2x2-default-rtdb.firebaseio.com",
  projectId: "mkdom2x2",
  storageBucket: "mkdom2x2.firebasestorage.app",
  messagingSenderId: "785636946586",
  appId: "1:785636946586:web:056f2308cec69fd1bde523"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app, firebaseConfig.databaseURL);
export default app;
