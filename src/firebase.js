import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDm_QBHrAKDsy8XUCI94J2LVyZ_7BnvGBY",
  authDomain: "agenticpl-1-5d306.firebaseapp.com",
  databaseURL: "https://agenticpl-1-5d306-default-rtdb.firebaseio.com",
  projectId: "agenticpl-1-5d306",
  storageBucket: "agenticpl-1-5d306.firebasestorage.app",
  messagingSenderId: "914823482437",
  appId: "1:914823482437:web:027e7eb4344d9c2c1d272c",
  measurementId: "G-37K2VV29B1",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
