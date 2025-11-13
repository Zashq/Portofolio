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

  
  async getAllProducts(limit = null, sort = 'asc') {
    const params = {}
    if (limit) params.limit = limit
    if (sort) params.sort = sort
    
    return this.client.get('/products', { params })
  }

  
  async getProductById(id) {
    return this.client.get(`/products/${id}`)
  }

  
  async getCategories() {
    return this.client.get('/products/categories')
  }

  
  async getProductsByCategory(category, limit = null, sort = 'asc') {
    const params = {}
    if (limit) params.limit = limit
    if (sort) params.sort = sort
    
    return this.client.get(`/products/category/${category}`, { params })
  }

  
  async addProduct(product) {
    return this.client.post('/products', product)
  }

  
  async updateProduct(id, product) {
    return this.client.put(`/products/${id}`, product)
  }

  
  async deleteProduct(id) {
    return this.client.delete(`/products/${id}`)
  }

  
  async getAllUsers() {
    return this.client.get('/users')
  }

  
  async getUserById(id) {
    return this.client.get(`/users/${id}`)
  }

  
  async getAllCarts() {
    return this.client.get('/carts')
  }

  
  async getCartById(id) {
    return this.client.get(`/carts/${id}`)
  }

  
  async getUserCarts(userId) {
    return this.client.get(`/carts/user/${userId}`)
  }

  
  async addCart(cart) {
    return this.client.post('/carts', cart)
  }

  
  async updateCart(id, cart) {
    return this.client.put(`/carts/${id}`, cart)
  }

  
  async deleteCart(id) {
    return this.client.delete(`/carts/${id}`)
  }

  
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
      
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data } = JSON.parse(cached)
        console.warn('Using expired cache due to API error')
        return data
      }
      throw error
    }
  }

  
  subscribeToProductUpdates(callback, interval = 60000) { // 1 minute
    const fetchUpdates = async () => {
      try {
        const products = await this.getAllProducts()
        
        
        const updatedProducts = products.map(product => ({
          ...product,
          price: product.price * (0.95 + Math.random() * 0.1),
          lastUpdated: new Date().toISOString()
        }))
        
        callback(updatedProducts)
      } catch (error) {
        console.error('Error fetching product updates:', error)
      }
    }

    
    fetchUpdates()
    
    
    const intervalId = setInterval(fetchUpdates, interval)
    
    
    return () => clearInterval(intervalId)
  }
}

export default new ProductService()
