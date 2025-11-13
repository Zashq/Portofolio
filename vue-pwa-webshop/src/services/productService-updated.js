import axios from 'axios'

// Use environment variable or fallback to external API
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3001/api'
const USE_LOCAL_API = process.env.VUE_APP_USE_LOCAL_API === 'true'

class ProductService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
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

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        // Handle both external API and local API response formats
        if (response.data.success !== undefined) {
          // Local API format
          return response.data.data
        }
        // External API format
        return response.data
      },
      error => {
        console.error('API Response Error:', error)
        if (error.response) {
          const message = error.response.data?.error || error.response.statusText
          throw new Error(`API Error: ${error.response.status} - ${message}`)
        } else if (error.request) {
          throw new Error('Network error: No response from server')
        } else {
          throw new Error('Request error: ' + error.message)
        }
      }
    )
  }

  /**
   * Get all products with optional filters
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by category
   * @param {number} options.minPrice - Minimum price
   * @param {number} options.maxPrice - Maximum price
   * @param {number} options.limit - Limit results
   * @param {string} options.sort - Sort order (price_asc, price_desc, name)
   */
  async getAllProducts(options = {}) {
    const params = {}
    if (options.category) params.category = options.category
    if (options.minPrice) params.minPrice = options.minPrice
    if (options.maxPrice) params.maxPrice = options.maxPrice
    if (options.limit) params.limit = options.limit
    if (options.sort) params.sort = options.sort
    
    return this.client.get('/products', { params })
  }

  /**
   * Get single product by ID
   * @param {number|string} id - Product ID
   */
  async getProductById(id) {
    return this.client.get(`/products/${id}`)
  }

  /**
   * Get all categories
   */
  async getCategories() {
    return this.client.get('/categories')
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} options - Additional options
   */
  async getProductsByCategory(category, options = {}) {
    const params = {}
    if (options.limit) params.limit = options.limit
    if (options.sort) params.sort = options.sort
    
    return this.client.get(`/products/category/${category}`, { params })
  }

  /**
   * Search products
   * @param {string} query - Search query
   */
  async searchProducts(query) {
    if (!query || query.trim() === '') {
      return []
    }
    return this.client.get('/products/search', {
      params: { q: query }
    })
  }

  /**
   * Get similar products
   * @param {number|string} id - Product ID
   * @param {number} limit - Number of similar products to return
   */
  async getSimilarProducts(id, limit = 4) {
    return this.client.get(`/products/${id}/similar`, {
      params: { limit }
    })
  }

  /**
   * Create a new product (admin only)
   * @param {Object} product - Product data
   */
  async createProduct(product) {
    return this.client.post('/products', product)
  }

  /**
   * Update a product (admin only)
   * @param {number|string} id - Product ID
   * @param {Object} updates - Product updates
   */
  async updateProduct(id, updates) {
    return this.client.put(`/products/${id}`, updates)
  }

  /**
   * Delete a product (admin only)
   * @param {number|string} id - Product ID
   */
  async deleteProduct(id) {
    return this.client.delete(`/products/${id}`)
  }

  /**
   * Bulk create products (admin only)
   * @param {Array} products - Array of product objects
   */
  async bulkCreateProducts(products) {
    return this.client.post('/products/bulk', { products })
  }

  /**
   * Fetch products with caching
   * @param {string} cacheKey - Cache key
   * @param {number} maxAge - Maximum cache age in milliseconds
   */
  async fetchProductsWithCache(cacheKey = 'products_cache', maxAge = 300000) {
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
      // Fallback to cached data on error
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data } = JSON.parse(cached)
        console.warn('Using expired cache due to API error')
        return data
      }
      throw error
    }
  }

  /**
   * Subscribe to product updates with polling
   * @param {Function} callback - Callback function to receive updates
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Function} Unsubscribe function
   */
  subscribeToProductUpdates(callback, interval = 60000) {
    const fetchUpdates = async () => {
      try {
        const products = await this.getAllProducts()
        callback(products)
      } catch (error) {
        console.error('Error fetching product updates:', error)
      }
    }

    // Initial fetch
    fetchUpdates()
    
    // Set up polling
    const intervalId = setInterval(fetchUpdates, interval)
    
    // Return unsubscribe function
    return () => clearInterval(intervalId)
  }

  /**
   * Get featured products (high-rated products)
   * @param {number} limit - Number of products to return
   */
  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts({ limit: 20 })
    return products
      .filter(p => p.rating?.rate >= 4.0)
      .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
      .slice(0, limit)
  }

  /**
   * Get products on sale (random discount simulation for demo)
   * @param {number} limit - Number of products to return
   */
  async getOnSaleProducts(limit = 8) {
    const products = await this.getAllProducts({ limit: 20 })
    // Simulate sale prices (in a real app, this would come from the backend)
    return products
      .map(p => ({
        ...p,
        originalPrice: p.price,
        price: p.price * 0.8, // 20% off
        discount: 20
      }))
      .slice(0, limit)
  }

  /**
   * Get API health status
   */
  async getHealthStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Clear product cache
   * @param {string} cacheKey - Cache key to clear
   */
  clearCache(cacheKey = 'products_cache') {
    localStorage.removeItem(cacheKey)
    console.log('Product cache cleared')
  }
}

export default new ProductService()
