import * as SecureStore from 'expo-secure-store';
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFSx7s5_VPSg6oZEXcfdkU8QvHSErzHyQ",
  authDomain: "alert-ph.firebaseapp.com",
  projectId: "alert-ph",
  storageBucket: "alert-ph.firebasestorage.app",
  messagingSenderId: "127760337489",
  appId: "1:127760337489:web:0b5e946c2af86af46f4670",
  measurementId: "G-M16JMNZB1X"
};

// 1. Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth with Secure Persistence
export const auth = (() => {
  // Check if already initialized to prevent "already-initialized" error
  if (getApps().length > 0) {
    try {
      const existingAuth = getAuth(app);
      if (existingAuth) return existingAuth;
    } catch (e) {
      // Not initialized yet, proceed to initializeAuth
    }
  }

  return initializeAuth(app, {
    persistence: getReactNativePersistence(SecureStore),
  });
})();

export const db = getFirestore(app);