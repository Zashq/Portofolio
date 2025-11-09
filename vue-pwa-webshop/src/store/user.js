import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/main'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => userData.value?.displayName || user.value?.email?.split('@')[0] || 'User')

  const checkAuth = () => {
    loading.value = true
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        await loadUserData(firebaseUser.uid)
      } else {
        user.value = null
        userData.value = null
      }
      loading.value = false
    })
  }

  const loadUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        userData.value = userDoc.data()
      } else {
        
        const newUserData = {
          email: user.value.email,
          displayName: user.value.displayName || user.value.email.split('@')[0],
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            newsletter: false,
            theme: 'light'
          },
          addresses: [],
          paymentMethods: []
        }
        await setDoc(doc(db, 'users', uid), newUserData)
        userData.value = newUserData
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      error.value = err.message
    }
  }

  const updateProfile = async (profileData) => {
    if (!user.value) return
    
    try {
      loading.value = true
      await updateDoc(doc(db, 'users', user.value.uid), profileData)
      userData.value = { ...userData.value, ...profileData }
      return { success: true }
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const addAddress = async (address) => {
    if (!user.value || !userData.value) return
    
    const addresses = userData.value.addresses || []
    addresses.push({
      id: Date.now().toString(),
      ...address
    })
    
    return updateProfile({ addresses })
  }

  const removeAddress = async (addressId) => {
    if (!user.value || !userData.value) return
    
    const addresses = userData.value.addresses.filter(a => a.id !== addressId)
    return updateProfile({ addresses })
  }

  const updatePreferences = async (preferences) => {
    if (!user.value) return
    
    return updateProfile({ 
      preferences: { ...userData.value.preferences, ...preferences }
    })
  }

  const logout = () => {
    user.value = null
    userData.value = null
  }

  return {
    user,
    userData,
    loading,
    error,
    isAuthenticated,
    displayName,
    checkAuth,
    updateProfile,
    addAddress,
    removeAddress,
    updatePreferences,
    logout
  }
})
