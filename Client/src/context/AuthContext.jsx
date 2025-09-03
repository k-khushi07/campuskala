import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

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

  // Register new user with profile creation
  const signup = async (formData) => {
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
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        phone: formData.phone,
        userType: formData.userType,
        college: '',
        department: '',
        year: '',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        location: '',
        isVerified: false,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          reviewsGiven: 0,
          averageRating: 0
        }
      }
      
      await setDoc(doc(db, 'users', user.uid), userProfileData)
      
      return user
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...profileData,
          updatedAt: new Date()
        })
        
        setUserProfile(prev => ({ ...prev, ...profileData }))
      } catch (error) {
        console.error('Update profile error:', error)
        throw error
      }
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user)
          // Fetch user profile from Firestore
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } else {
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
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
