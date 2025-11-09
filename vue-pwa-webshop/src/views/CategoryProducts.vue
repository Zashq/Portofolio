<template>
  <v-container>
    <!-- Category Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn variant="text" @click="$router.push('/categories')">
          <v-icon left>mdi-arrow-left</v-icon>
          All Categories
        </v-btn>
        <h1 class="text-h3 font-weight-bold mt-2 text-capitalize">
          {{ categoryName }}
        </h1>
        <p class="text-subtitle-1 text-grey">
          {{ products.length }} products available
        </p>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort By"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="minPrice"
          label="Min Price"
          type="number"
          outlined
          dense
          prefix="$"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="maxPrice"
          label="Max Price"
          type="number"
          outlined
          dense
          prefix="$"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn
          color="secondary"
          variant="outlined"
          block
          @click="clearFilters"
        >
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading products...</p>
      </v-col>
    </v-row>

    <!-- No Products -->
    <v-row v-else-if="filteredProducts.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
        <h2 class="text-h4 mt-4 mb-2">No products found</h2>
        <p class="text-grey mb-6">Try adjusting your filters</p>
        <v-btn color="primary" @click="clearFilters">
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

    <!-- Products Grid -->
    <v-row v-else>
      <v-col
        v-for="product in paginatedProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ProductCard :product="product" />
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row v-if="totalPages > 1" class="mt-4">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/store/products'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'CategoryProductsView',
  components: {
    ProductCard
  },
  setup() {
    const route = useRoute()
    const productsStore = useProductsStore()
    
    const products = ref([])
    const loading = ref(true)
    const sortBy = ref('default')
    const minPrice = ref('')
    const maxPrice = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    const categoryName = computed(() => route.params.category)
    
    const sortOptions = [
      { title: 'Default', value: 'default' },
      { title: 'Price: Low to High', value: 'price-asc' },
      { title: 'Price: High to Low', value: 'price-desc' },
      { title: 'Name: A to Z', value: 'name-asc' },
      { title: 'Rating: High to Low', value: 'rating-desc' }
    ]
    
    const filteredProducts = computed(() => {
      let filtered = [...products.value]
      
      
      if (minPrice.value !== '') {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice.value))
      }
      if (maxPrice.value !== '') {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice.value))
      }
      
      
      switch (sortBy.value) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'name-asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title))
          break
        case 'rating-desc':
          filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
          break
      }
      
      return filtered
    })
    
    const totalPages = computed(() => 
      Math.ceil(filteredProducts.value.length / itemsPerPage)
    )
    
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredProducts.value.slice(start, end)
    })
    
    const loadProducts = async () => {
      loading.value = true
      try {
        products.value = await productsStore.getProductsByCategory(categoryName.value)
      } catch (error) {
        console.error('Error loading category products:', error)
      } finally {
        loading.value = false
      }
    }
    
    const clearFilters = () => {
      sortBy.value = 'default'
      minPrice.value = ''
      maxPrice.value = ''
      currentPage.value = 1
    }
    
    watch(() => route.params.category, () => {
      loadProducts()
      clearFilters()
    })
    
    watch([sortBy, minPrice, maxPrice], () => {
      currentPage.value = 1
    })
    
    onMounted(() => {
      loadProducts()
    })
    
    return {
      categoryName,
      products,
      loading,
      sortBy,
      sortOptions,
      minPrice,
      maxPrice,
      currentPage,
      filteredProducts,
      paginatedProducts,
      totalPages,
      clearFilters
    }
  }
}
</script>
