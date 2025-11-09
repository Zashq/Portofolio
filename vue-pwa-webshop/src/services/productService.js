import axios from 'axios'

const API_BASE_URL = 'https://fakestoreapi.com'

class ProductService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      config => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      error => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API Response Error:', error)
        if (error.response) {
          throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error('Network error: No response from server')
        } else {
          throw new Error('Request error: ' + error.message)
        }
      }
    )
  }

  // Get all products
  async getAllProducts(limit = null, sort = 'asc') {
    const params = {}
    if (limit) params.limit = limit
    if (sort) params.sort = sort
    
    return this.client.get('/products', { params })
  }

  // Get single product
  async getProductById(id) {
    return this.client.get(`/products/${id}`)
  }

  // Get all categories
  async getCategories() {
    return this.client.get('/products/categories')
  }

  // Get products by category
  async getProductsByCategory(category, limit = null, sort = 'asc') {
    const params = {}
    if (limit) params.limit = limit
    if (sort) params.sort = sort
    
    return this.client.get(`/products/category/${category}`, { params })
  }

  // Add new product (fake - not actually saved)
  async addProduct(product) {
    return this.client.post('/products', product)
  }

  // Update product (fake - not actually saved)
  async updateProduct(id, product) {
    return this.client.put(`/products/${id}`, product)
  }

  // Delete product (fake - not actually deleted)
  async deleteProduct(id) {
    return this.client.delete(`/products/${id}`)
  }

  // Get all users (for admin purposes)
  async getAllUsers() {
    return this.client.get('/users')
  }

  // Get single user
  async getUserById(id) {
    return this.client.get(`/users/${id}`)
  }

  // Get all carts
  async getAllCarts() {
    return this.client.get('/carts')
  }

  // Get single cart
  async getCartById(id) {
    return this.client.get(`/carts/${id}`)
  }

  // Get user carts
  async getUserCarts(userId) {
    return this.client.get(`/carts/user/${userId}`)
  }

  // Add new cart
  async addCart(cart) {
    return this.client.post('/carts', cart)
  }

  // Update cart
  async updateCart(id, cart) {
    return this.client.put(`/carts/${id}`, cart)
  }

  // Delete cart
  async deleteCart(id) {
    return this.client.delete(`/carts/${id}`)
  }

  // Custom method for batch fetching with caching
  async fetchProductsWithCache(cacheKey = 'products_cache', maxAge = 300000) { // 5 minutes
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < maxAge) {
          console.log('Using cached products')
          return data
        }
      }

      const data = await this.getAllProducts()
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      
      return data
    } catch (error) {
      // If API fails, try to use cached data even if expired
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data } = JSON.parse(cached)
        console.warn('Using expired cache due to API error')
        return data
      }
      throw error
    }
  }

  // Mock real-time updates (simulate WebSocket behavior)
  subscribeToProductUpdates(callback, interval = 60000) { // 1 minute
    const fetchUpdates = async () => {
      try {
        const products = await this.getAllProducts()
        
        // Simulate random price changes
        const updatedProducts = products.map(product => ({
          ...product,
          price: product.price * (0.95 + Math.random() * 0.1), // ±5% price variation
          lastUpdated: new Date().toISOString()
        }))
        
        callback(updatedProducts)
      } catch (error) {
        console.error('Error fetching product updates:', error)
      }
    }

    // Initial fetch
    fetchUpdates()
    
    // Set up interval
    const intervalId = setInterval(fetchUpdates, interval)
    
    // Return unsubscribe function
    return () => clearInterval(intervalId)
  }
}

export default new ProductService()
