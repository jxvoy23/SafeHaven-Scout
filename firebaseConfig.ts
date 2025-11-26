import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your specific configuration from the file you uploaded
const firebaseConfig = {
  apiKey: "AIzaSyC-7Osm-sp3gMjuxVhNxTgDZCAfWUIkPWM",
  authDomain: "safehaven-scout.firebaseapp.com",
  projectId: "safehaven-scout",
  storageBucket: "safehaven-scout.firebasestorage.app",
  messagingSenderId: "901435974106",
  appId: "1:901435974106:web:bd59ba643acb2a1121e0e3",
  measurementId: "G-2DCE65ZMD0"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Services
// We only initialized Analytics in your old file, but we need Auth and Firestore for the App to work.
const analytics = getAnalytics(app);

// 3. Export Services (Critical Step: This fixes your error)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);