<template>
  <v-container>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold">All Products</h1>
        <p class="text-subtitle-1 text-grey">Browse our complete collection</p>
      </v-col>
    </v-row>

    <!-- Filters and Sort -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedCategory"
          :items="categoryOptions"
          label="Category"
          outlined
          dense
          clearable
        ></v-select>
      </v-col>
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
          prefix="€"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="maxPrice"
          label="Max Price"
          type="number"
          outlined
          dense
          prefix="€"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Products Grid -->
    <v-row v-if="loading" class="my-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading products...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" prominent>
          <v-row align="center">
            <v-col class="grow">
              {{ error }}
            </v-col>
            <v-col class="shrink">
              <v-btn @click="loadProducts">Retry</v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="filteredProducts.length === 0">
      <v-col cols="12" class="text-center my-8">
        <v-icon size="64" color="grey">mdi-package-variant</v-icon>
        <h2 class="text-h5 mt-4">No products found</h2>
        <p class="text-grey">Try adjusting your filters</p>
        <v-btn color="primary" class="mt-4" @click="clearFilters">
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

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
          @update:model-value="scrollToTop"
        ></v-pagination>
      </v-col>
    </v-row>

    <!-- Results Count -->
    <v-row class="mt-2">
      <v-col cols="12" class="text-center">
        <p class="text-caption text-grey">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredProducts.length }} products
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore } from '@/store/products'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'ProductsView',
  components: {
    ProductCard
  },
  setup() {
    const productsStore = useProductsStore()
    
    const selectedCategory = ref(null)
    const sortBy = ref('default')
    const minPrice = ref('')
    const maxPrice = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    const sortOptions = [
      { title: 'Default', value: 'default' },
      { title: 'Price: Low to High', value: 'price-asc' },
      { title: 'Price: High to Low', value: 'price-desc' },
      { title: 'Name: A to Z', value: 'name-asc' },
      { title: 'Name: Z to A', value: 'name-desc' },
      { title: 'Rating: High to Low', value: 'rating-desc' }
    ]
    
    const categoryOptions = computed(() => {
      return [
        { title: 'All Categories', value: null },
        ...productsStore.categories.map(cat => ({
          title: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat
        }))
      ]
    })
    
    const loading = computed(() => productsStore.loading)
    const error = computed(() => productsStore.error)
    
    const filteredProducts = computed(() => {
      let products = [...productsStore.products]
      
      
      if (selectedCategory.value) {
        products = products.filter(p => p.category === selectedCategory.value)
      }
      
      
      if (minPrice.value !== '') {
        products = products.filter(p => p.price >= parseFloat(minPrice.value))
      }
      if (maxPrice.value !== '') {
        products = products.filter(p => p.price <= parseFloat(maxPrice.value))
      }
      
      
      switch (sortBy.value) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          products.sort((a, b) => b.price - a.price)
          break
        case 'name-asc':
          products.sort((a, b) => a.title.localeCompare(b.title))
          break
        case 'name-desc':
          products.sort((a, b) => b.title.localeCompare(a.title))
          break
        case 'rating-desc':
          products.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
          break
      }
      
      return products
    })
    
    const totalPages = computed(() => 
      Math.ceil(filteredProducts.value.length / itemsPerPage)
    )
    
    const startIndex = computed(() => 
      (currentPage.value - 1) * itemsPerPage
    )
    
    const endIndex = computed(() => 
      Math.min(startIndex.value + itemsPerPage, filteredProducts.value.length)
    )
    
    const paginatedProducts = computed(() => 
      filteredProducts.value.slice(startIndex.value, endIndex.value)
    )
    
    const clearFilters = () => {
      selectedCategory.value = null
      sortBy.value = 'default'
      minPrice.value = ''
      maxPrice.value = ''
      currentPage.value = 1
    }
    
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    const loadProducts = async () => {
      await Promise.all([
        productsStore.loadProducts(),
        productsStore.loadCategories()
      ])
    }
    
    
    watch([selectedCategory, sortBy, minPrice, maxPrice], () => {
      currentPage.value = 1
    })
    
    onMounted(() => {
      loadProducts()
    })
    
    return {
      selectedCategory,
      sortBy,
      minPrice,
      maxPrice,
      currentPage,
      sortOptions,
      categoryOptions,
      loading,
      error,
      filteredProducts,
      paginatedProducts,
      totalPages,
      startIndex,
      endIndex,
      clearFilters,
      scrollToTop,
      loadProducts
    }
  }
}
</script>
