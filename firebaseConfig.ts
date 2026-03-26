import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Paste your actual keys from the Firebase Console here!
const firebaseConfig = {
  apiKey: "AIzaSyCFSx7s5_VPSg6oZEXcfdkU8QvHSErzHyQ",
  authDomain: "alert-ph.firebaseapp.com",
  projectId: "alert-ph",
  storageBucket: "alert-ph.firebasestorage.app",
  messagingSenderId: "127760337489",
  appId: "1:127760337489:web:0b5e946c2af86af46f4670",
  measurementId: "G-M16JMNZB1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so you can use them in your login screen
export const auth = getAuth(app);
export const db = getFirestore(app);