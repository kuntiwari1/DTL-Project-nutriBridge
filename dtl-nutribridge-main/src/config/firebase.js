// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEIVigCunrRhXIKbki3lGY7F3TNBlTgFM",
  authDomain: "nutribridge-fa1d5.firebaseapp.com",
  databaseURL: "https://nutribridge-fa1d5-default-rtdb.firebaseio.com",
  projectId: "nutribridge-fa1d5",
  storageBucket: "nutribridge-fa1d5.firebasestorage.app",
  messagingSenderId: "172492159001",
  appId: "1:172492159001:web:00a9e26d7a811801fb5288",
  measurementId: "G-09JW41QV09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;