import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/main'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const itemsCount = computed(() =>
    items.value.reduce((total, item) => total + (item.quantity || 0), 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0)
  )

  const tax = computed(() => subtotal.value * 0.08)
  const shipping = computed(() => (subtotal.value > 50 ? 0 : 10))
  const total = computed(() => subtotal.value + tax.value + shipping.value)

  const saveCartLocally = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(items.value))
    } catch (e) {
      console.error('Error saving cart locally:', e)
    }
  }

  const loadCart = async () => {
    const userStore = useUserStore()

    // Try to load from localStorage first
    const localCart = localStorage.getItem('cart')
    if (localCart) items.value = JSON.parse(localCart)

    // If authenticated, sync with Firestore
    if (userStore.isAuthenticated && userStore.user) {
      try {
        loading.value = true
        const cartDoc = await getDoc(doc(db, 'carts', userStore.user.uid))
        if (cartDoc.exists()) {
          items.value = cartDoc.data().items || []
          saveCartLocally()
        }
      } catch (error) {
        console.error('Error loading cart from Firestore:', error)
      } finally {
        loading.value = false
      }
    }
  }

  const saveCart = async () => {
    const userStore = useUserStore()
    // Save to localStorage first
    saveCartLocally()

    // Save to Firestore if authenticated
    if (userStore.isAuthenticated && userStore.user) {
      try {
        await setDoc(doc(db, 'carts', userStore.user.uid), {
          items: items.value,
          updatedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error saving cart to Firestore:', error)
      }
    }
  }

  const addItem = async (product) => {
    const existingItem = items.value.find((item) => item.id === product.id)
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
      })
    }

    saveCartLocally()
    await saveCart()
    await addToHistory(product)
    return { success: true }
  }

  const updateQuantity = async (productId, quantity) => {
    const item = items.value.find((item) => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        await removeItem(productId)
      } else {
        item.quantity = quantity
        await saveCart()
      }
    }
  }

  const removeItem = async (productId) => {
    const index = items.value.findIndex((item) => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      await saveCart()
    }
  }

  const clearCart = async () => {
    items.value = []
    await saveCart()
  }

  const addToHistory = async (product) => {
    const userStore = useUserStore()
    if (!userStore.isAuthenticated || !userStore.user) return

    try {
      const history = {
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        action: 'added_to_cart',
        timestamp: new Date().toISOString(),
        userId: userStore.user.uid,
      }

      await setDoc(doc(db, 'history', `${userStore.user.uid}_${Date.now()}`), history)
    } catch (error) {
      console.error('Error adding to history:', error)
    }
  }

  const getRecommendations = computed(() => {
    const categories = [...new Set(items.value.map((item) => item.category).filter(Boolean))]
    return categories
  })

  return {
    items,
    loading,
    itemsCount,
    subtotal,
    tax,
    shipping,
    total,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getRecommendations,
  }
})
