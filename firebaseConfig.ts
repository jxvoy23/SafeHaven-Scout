// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-7Osm-sp3gMjuxVhNxTgDZCAfWUIkPWM",
  authDomain: "safehaven-scout.firebaseapp.com",
  projectId: "safehaven-scout",
  storageBucket: "safehaven-scout.firebasestorage.app",
  messagingSenderId: "901435974106",
  appId: "1:901435974106:web:bd59ba643acb2a1121e0e3",
  measurementId: "G-2DCE65ZMD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);