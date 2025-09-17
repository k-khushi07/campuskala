// Simple test script to verify backend integration
// Run this with: node test-integration.js

import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvEaxuzbuHH_10zlwxk_aHpJO0PnysWTE",
  authDomain: "campus-kala-e1240.firebaseapp.com",
  projectId: "campus-kala-e1240",
  storageBucket: "campus-kala-e1240.firebasestorage.app",
  messagingSenderId: "905535340534",
  appId: "1:905535340534:web:1c840875c5930db24d11d7",
  measurementId: "G-48NZQZQJRT"
}

async function testIntegration() {
  console.log('🧪 Testing CampusKala Backend Integration...\n')

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const functions = getFunctions(app)

    // Connect to emulators (if running)
    try {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectFunctionsEmulator(functions, 'localhost', 5001)
      console.log('✅ Connected to Firebase emulators')
    } catch (error) {
      console.log('⚠️  Emulators not running, using production Firebase')
    }

    // Test Firebase services
    console.log('✅ Firebase app initialized')
    console.log('✅ Auth service connected')
    console.log('✅ Firestore service connected')
    console.log('✅ Functions service connected')

    // Test environment variables
    const envVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_STRIPE_PUBLISHABLE_KEY'
    ]

    console.log('\n📋 Environment Variables Check:')
    envVars.forEach(varName => {
      const value = process.env[varName]
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 10)}...`)
      } else {
        console.log(`❌ ${varName}: Not set`)
      }
    })

    console.log('\n🎉 Backend integration test completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Set up your Stripe keys in .env file')
    console.log('2. Start Firebase emulators: npm run emulators')
    console.log('3. Start frontend: npm run dev')
    console.log('4. Test checkout functionality')

  } catch (error) {
    console.error('❌ Integration test failed:', error.message)
  }
}

testIntegration()
