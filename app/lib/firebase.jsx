// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// ✅ Your Firebase config (from console)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Register new user
export const registerUser = async (email, password, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification to Gmail
    await sendEmailVerification(user);

    // Store phone number & info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      phone,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: "Signup successful! Check your Gmail for verification link." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ✅ Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      return { success: false, message: "Please verify your email before logging in." };
    }

    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ✅ Logout user
export const logoutUser = async () => {
  await signOut(auth);
};

// ✅ Track login state (auto-login)
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export initialized Firebase modules
export { auth, db };
