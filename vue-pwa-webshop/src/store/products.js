import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ProductService from '@/services/productService'
import { db } from '@/main'
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)
  const priceHistory = ref({})

  const featuredProducts = computed(() => 
    products.value.slice(0, 4)
  )

  const loadProducts = async (force = false) => {
    const now = Date.now()
    if (!force && lastFetch.value && (now - lastFetch.value) < 5 * 60 * 1000) {
      return products.value
    }

    try {
      loading.value = true
      error.value = null
      
      const data = await ProductService.getAllProducts()
      products.value = data
      lastFetch.value = now
      
      await storeProductsInFirestore(data)
      
      await trackPriceChanges(data)
      
      return data
    } catch (err) {
      console.error('Error loading products:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      loading.value = true
      categories.value = await ProductService.getCategories()
      return categories.value
    } catch (err) {
      console.error('Error loading categories:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getProductById = async (id) => {
    const existing = products.value.find(p => p.id === parseInt(id))
    if (existing) return existing

    try {
      loading.value = true
      const product = await ProductService.getProductById(id)
      
      await loadPriceHistory(id)
      
      return product
    } catch (err) {
      console.error('Error loading product:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const getProductsByCategory = async (category) => {
    try {
      loading.value = true
      const data = await ProductService.getProductsByCategory(category)
      return data
    } catch (err) {
      console.error('Error loading category products:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const searchProducts = (query) => {
    const searchTerm = query.toLowerCase()
    return products.value.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    )
  }

  const storeProductsInFirestore = async (productsData) => {
    try {
      const batch = []
      const timestamp = new Date().toISOString()
      
      for (const product of productsData) {
        batch.push(
          setDoc(doc(db, 'products', product.id.toString()), {
            ...product,
            lastUpdated: timestamp
          }, { merge: true })
        )
      }
      
      await Promise.all(batch)
    } catch (err) {
      console.error('Error storing products in Firestore:', err)
    }
  }

  const trackPriceChanges = async (productsData) => {
    try {
      const timestamp = new Date().toISOString()
      
      for (const product of productsData) {
        await setDoc(
          doc(db, 'priceHistory', `${product.id}_${Date.now()}`),
          {
            productId: product.id,
            price: product.price,
            timestamp
          }
        )
        
        const previousPrice = await getPreviousPrice(product.id)
        if (previousPrice && product.price < previousPrice) {
          await checkPriceAlerts(product.id, previousPrice, product.price)
        }
      }
    } catch (err) {
      console.error('Error tracking price changes:', err)
    }
  }

  const getPreviousPrice = async (productId) => {
    try {
      const q = query(
        collection(db, 'priceHistory'),
        orderBy('timestamp', 'desc'),
        limit(2)
      )
      
      const snapshot = await getDocs(q)
      const prices = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.productId === productId) {
          prices.push(data.price)
        }
      })
      
      return prices[1] || null 
    } catch (err) {
      console.error('Error getting previous price:', err)
      return null
    }
  }

  const loadPriceHistory = async (productId) => {
    try {
      const q = query(
        collection(db, 'priceHistory'),
        orderBy('timestamp', 'desc'),
        limit(30)
      )
      
      const snapshot = await getDocs(q)
      const history = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.productId === parseInt(productId)) {
          history.push({
            price: data.price,
            date: data.timestamp
          })
        }
      })
      
      priceHistory.value[productId] = history
      return history
    } catch (err) {
      console.error('Error loading price history:', err)
      return []
    }
  }

  const checkPriceAlerts = async (productId, oldPrice, newPrice) => {
    const product = products.value.find(p => p.id === productId)
    if (product) {
      const percentage = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      
      console.log(`Price drop alert: ${product.title} dropped by ${percentage}%`)
    }
  }

  return {
    products,
    categories,
    loading,
    error,
    priceHistory,
    featuredProducts,
    loadProducts,
    loadCategories,
    getProductById,
    getProductsByCategory,
    searchProducts,
    loadPriceHistory
  }
})
