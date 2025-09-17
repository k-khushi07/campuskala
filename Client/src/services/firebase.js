import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { getMessaging } from 'firebase/messaging'

// Your Firebase config
=======
import { getMessaging, onMessage } from 'firebase/messaging'
import { getStorage } from 'firebase/storage'

// Firebase config from environment variables
>>>>>>> Stashed changes
=======
import { getMessaging, onMessage } from 'firebase/messaging'
import { getStorage } from 'firebase/storage'

// Firebase config from environment variables
>>>>>>> Stashed changes
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvEaxuzbuHH_10zlwxk_aHpJO0PnysWTE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campus-kala-e1240.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campus-kala-e1240",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campus-kala-e1240.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "905535340534",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:905535340534:web:1c840875c5930db24d11d7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-48NZQZQJRT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)
<<<<<<< Updated upstream

// Configure Google Auth Provider
export const provider = new GoogleAuthProvider()
provider.addScope('email')
provider.addScope('profile')

// ❌ REMOVED: Don't set custom parameters globally
// Let AuthContext handle this dynamically for better control
=======
>>>>>>> Stashed changes

// Initialize messaging for notifications (optional)
let messaging = null
try {
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app)
  }
} catch (error) {
  console.log('Firebase Messaging not supported:', error)
}

export { messaging }

// Helper function to handle Firebase errors
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
    'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations.',
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'The resource already exists.',
    'failed-precondition': 'Operation failed due to a precondition.',
    'unavailable': 'Service is currently unavailable. Please try again later.',
  }
     
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.'
}

// Analytics and performance monitoring
export const logEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

// Export the initialized app
export default app