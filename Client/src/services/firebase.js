import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your Firebase config (the one you just copied from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDvEaxuzbuHH_10zlwxk_aHpJO0PnysWTE",
  authDomain: "campus-kala-e1240.firebaseapp.com",
  projectId: "campus-kala-e1240",
  storageBucket: "campus-kala-e1240.firebasestorage.app",
  messagingSenderId: "905535340534",
  appId: "1:905535340534:web:1c840875c5930db24d11d7",
  measurementId: "G-48NZQZQJRT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Export the initialized app
export default app
