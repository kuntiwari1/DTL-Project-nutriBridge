// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEIVigCunrRhXIKbki3lGY7F3TNBlTgFM",
  authDomain: "nutribridge-fa1d5.firebaseapp.com",
  projectId: "nutribridge-fa1d5",
  storageBucket: "nutribridge-fa1d5.firebasestorage.app",
  messagingSenderId: "172492159001",
  appId: "1:172492159001:web:00a9e26d7a811801fb5288",
  measurementId: "G-09JW41QV09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Development mode - uncomment to use Firebase emulators
if (import.meta.env.DEV) {
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectStorageEmulator(storage, 'localhost', 9199)
}

export default app
export { firebaseConfig }