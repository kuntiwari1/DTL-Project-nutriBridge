import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, additionalData) {
    try {
      console.log('🔥 REGISTER DEBUG - Starting registration...')
      console.log('📧 Email:', email)
      console.log('👤 Additional data:', additionalData)

      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('✅ Firebase user created:', result.user.uid)

      // Update display name
      if (additionalData.name) {
        await updateProfile(result.user, {
          displayName: additionalData.name
        })
        console.log('✅ Display name updated')
      }

      // Create user profile in Firestore
      const userProfile = {
        uid: result.user.uid,
        email: email,
        name: additionalData.name || '',
        role: additionalData.role || 'parent',
        phone: additionalData.phone || '',
        organization: additionalData.organization || '',
        location: additionalData.location || '',
        createdAt: new Date().toISOString(),
        children: [],
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true
        }
      }

      await setDoc(doc(db, 'users', result.user.uid), userProfile)
      console.log('✅ User profile created in Firestore')

      return result
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      console.log('🔥 LOGIN DEBUG - Starting login...')
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful')
      
      // Fetch user profile
      await fetchUserProfile(result.user.uid)
      
      return result
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  async function fetchUserProfile(uid) {
    try {
      console.log('🔍 Fetching user profile for UID:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (userDoc.exists()) {
        const profileData = userDoc.data()
        setUserProfile(profileData)
        console.log('✅ User profile loaded:', profileData.role)
      } else {
        console.log('⚠️ User profile not found, creating default profile...')
        
        // 🔧 AUTO-CREATE MISSING PROFILE
        const defaultProfile = {
          uid: uid,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || 'User',
          role: 'parent', // Default role
          phone: '',
          organization: '',
          location: '',
          createdAt: new Date().toISOString(),
          children: [],
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true
          }
        }

        // Create the document
        await setDoc(doc(db, 'users', uid), defaultProfile)
        setUserProfile(defaultProfile)
        console.log('✅ Default user profile created:', defaultProfile)
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      
      // 🔧 FALLBACK: Create basic profile even on error
      const fallbackProfile = {
        uid: uid,
        email: auth.currentUser?.email || '',
        name: auth.currentUser?.displayName || 'User',
        role: 'parent',
        children: [],
        createdAt: new Date().toISOString()
      }
      
      setUserProfile(fallbackProfile)
      console.log('⚠️ Using fallback profile:', fallbackProfile)
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      setUserProfile(null)
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout error:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.email)
      
      if (user) {
        setUser(user)
        await fetchUserProfile(user.uid)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    register,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}