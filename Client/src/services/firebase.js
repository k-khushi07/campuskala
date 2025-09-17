import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'

// Your Firebase config
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
export const functions = getFunctions(app)

// Configure Google Auth Provider
export const provider = new GoogleAuthProvider()
provider.addScope('email')
provider.addScope('profile')

// ❌ REMOVED: Don't set custom parameters globally
// Let AuthContext handle this dynamically for better control

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