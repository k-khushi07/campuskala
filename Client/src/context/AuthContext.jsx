import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, getFirebaseErrorMessage, logEvent } from '../services/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    const userProfileData = {
      uid: user.uid,
      email: user.email,
      displayName: additionalData.name || user.displayName || '',
      phone: additionalData.phone || '',
      userType: additionalData.userType || 'buyer', // buyer, seller, freelancer, both
      role: 'user', // user, admin, moderator
      
      // Profile info
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      bio: additionalData.bio || '',
      college: additionalData.college || '',
      department: additionalData.department || '',
      year: additionalData.year || '',
      location: additionalData.location || '',
      skills: additionalData.skills || [],
      
      // Verification status
      isVerified: false,
      isEmailVerified: user.emailVerified || false,
      verificationDocuments: [],
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      
      // Stats and metrics
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        totalEarned: 0,
        totalSales: 0,
        wishlistItems: 0,
        reviewsGiven: 0,
        reviewsReceived: 0,
        averageRating: 0,
        completionRate: 100,
        responseTime: 24, // hours
      },
      
      // Preferences
      preferences: {
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
        privacy: {
          showEmail: false,
          showPhone: false,
          profileVisibility: 'public', // public, private, friends
        },
        language: 'en',
        currency: 'INR',
      },
      
      // Platform-specific data
      stripeCustomerId: null, // Will be set by Stripe extension
      paymentMethods: [],
      addresses: [],
      
      // Freelancer specific data (if applicable)
      freelancer: additionalData.userType === 'freelancer' || additionalData.userType === 'both' ? {
        title: '',
        hourlyRate: 0,
        availability: 'available', // available, busy, offline
        portfolio: [],
        certifications: [],
        languages: ['English'],
        workingHours: {
          timezone: 'Asia/Kolkata',
          schedule: {
            monday: { available: true, start: '09:00', end: '18:00' },
            tuesday: { available: true, start: '09:00', end: '18:00' },
            wednesday: { available: true, start: '09:00', end: '18:00' },
            thursday: { available: true, start: '09:00', end: '18:00' },
            friday: { available: true, start: '09:00', end: '18:00' },
            saturday: { available: false, start: '09:00', end: '18:00' },
            sunday: { available: false, start: '09:00', end: '18:00' },
          }
        }
      } : null
    }
    
    await setDoc(doc(db, 'users', user.uid), userProfileData)
    return userProfileData
  }

  // Register new user
  const signup = async (formData) => {
    setAuthLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      // Update auth profile
      await updateProfile(user, {
        displayName: formData.name
      })

      // Send verification email
      await sendEmailVerification(user)
      
      // Create user profile in Firestore
      const userProfileData = await createUserProfile(user, formData)
      
      // Log signup event
      logEvent('sign_up', {
        method: 'email',
        user_type: formData.userType
      })
      
      return { user, userProfile: userProfileData }
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      setAuthLoading(false)
    }
  }

  // Login with email/password
  const login = async (email, password) => {
    setAuthLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Update last login
      if (result.user) {
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date(),
          updatedAt: new Date()
        })
      }
      
      // Log login event
      logEvent('login', { method: 'email' })
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      setAuthLoading(false)
    }
  }

  // Google Sign In
  const signInWithGoogle = async () => {
    setAuthLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      if (!userDoc.exists()) {
        await createUserProfile(result.user, { userType: 'buyer' })
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date(),
          updatedAt: new Date()
        })
      }
      
      // Log login event
      logEvent('login', { method: 'google' })
      
      return result
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    setAuthLoading(true)
    try {
      await signOut(auth)
      
      // Log logout event
      logEvent('logout')
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      setAuthLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      
      // Log password reset event
      logEvent('password_reset_request')
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    }
  }

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        updatedAt: new Date()
      })
      
      // Log profile update event
      logEvent('profile_update')
      
      return true
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    }
  }

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      return userDoc.exists() ? userDoc.data() : null
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return userProfile?.role === role
  }

  // Check if user can perform action
  const canPerformAction = (action) => {
    if (!userProfile) return false
    
    const permissions = {
      'create_product': ['seller', 'both'],
      'create_service': ['freelancer', 'both'],
      'manage_orders': ['seller', 'freelancer', 'both'],
      'admin_access': ['admin'],
      'moderate_content': ['admin', 'moderator']
    }
    
    const allowedUserTypes = permissions[action]
    if (!allowedUserTypes) return true
    
    return allowedUserTypes.includes(userProfile.userType) || hasRole('admin')
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user)
          
          // Set up real-time listener for user profile
          const profileUnsubscribe = onSnapshot(
            doc(db, 'users', user.uid),
            (doc) => {
              if (doc.exists()) {
                setUserProfile(doc.data())
              }
            },
            (error) => {
              console.error('Profile subscription error:', error)
            }
          )

          // Store the unsubscribe function
          setCurrentUser(prevUser => ({
            ...user,
            _profileUnsubscribe: profileUnsubscribe
          }))
        } else {
          // Clean up profile subscription
          if (currentUser?._profileUnsubscribe) {
            currentUser._profileUnsubscribe()
          }
          setCurrentUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    authLoading,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    getUserProfile,
    hasRole,
    canPerformAction
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
