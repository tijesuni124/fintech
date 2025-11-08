// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDinDD-cDv4YzHWyUrV1e6uLmLvQzAMS1Y",
  authDomain: "fintech-decf7.firebaseapp.com",
  projectId: "fintech-decf7",
  storageBucket: "fintech-decf7.firebasestorage.app",
  messagingSenderId: "279204184447",
  appId: "1:279204184447:android:55f2ba1fcfe8989a649a4a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

