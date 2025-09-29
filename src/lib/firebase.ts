// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-2971268335-98292",
  "appId": "1:947718002462:web:c89e8a3c5ac17eeb295b0f",
  "apiKey": "AIzaSyBwqkro8OLglvjzKJSkSdOS1hw1qeqyAZo",
  "authDomain": "studio-2971268335-98292.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "947718002462"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
