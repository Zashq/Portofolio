<template>
  <v-container>
    <!-- Search Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Search Results</h1>
        <p class="text-subtitle-1 text-grey">
          {{ results.length }} results for "{{ searchQuery }}"
        </p>
      </v-col>
    </v-row>

    <!-- Search Bar -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Search products..."
          prepend-inner-icon="mdi-magnify"
          outlined
          dense
          clearable
          @keyup.enter="performSearch"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          outlined
          dense
        ></v-select>
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
        <p class="mt-4">Searching...</p>
      </v-col>
    </v-row>

    <!-- No Results -->
    <v-row v-else-if="results.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey-lighten-2">mdi-magnify</v-icon>
        <h2 class="text-h4 mt-4 mb-2">No results found</h2>
        <p class="text-grey mb-6">Try different keywords or browse our categories</p>
        <v-btn color="primary" to="/categories">
          Browse Categories
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search Results -->
    <v-row v-else>
      <v-col
        v-for="product in paginatedResults"
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
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/store/products'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'SearchView',
  components: {
    ProductCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const productsStore = useProductsStore()
    
    const searchQuery = ref('')
    const results = ref([])
    const loading = ref(false)
    const sortBy = ref('relevance')
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    const sortOptions = [
      { title: 'Relevance', value: 'relevance' },
      { title: 'Price: Low to High', value: 'price-asc' },
      { title: 'Price: High to Low', value: 'price-desc' },
      { title: 'Name: A to Z', value: 'name-asc' }
    ]
    
    const sortedResults = computed(() => {
      let sorted = [...results.value]
      
      switch (sortBy.value) {
        case 'price-asc':
          sorted.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          sorted.sort((a, b) => b.price - a.price)
          break
        case 'name-asc':
          sorted.sort((a, b) => a.title.localeCompare(b.title))
          break
      }
      
      return sorted
    })
    
    const totalPages = computed(() => 
      Math.ceil(sortedResults.value.length / itemsPerPage)
    )
    
    const paginatedResults = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return sortedResults.value.slice(start, end)
    })
    
    const performSearch = async () => {
      if (!searchQuery.value) return
      
      loading.value = true
      try {
        await productsStore.loadProducts()
        results.value = productsStore.searchProducts(searchQuery.value)
        currentPage.value = 1
        
        router.push({ query: { q: searchQuery.value } })
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        loading.value = false
      }
    }
    
    watch(() => route.query.q, (newQuery) => {
      if (newQuery) {
        searchQuery.value = newQuery
        performSearch()
      }
    })
    
    onMounted(() => {
      const query = route.query.q
      if (query) {
        searchQuery.value = query
        performSearch()
      }
    })
    
    return {
      searchQuery,
      results,
      loading,
      sortBy,
      sortOptions,
      currentPage,
      totalPages,
      paginatedResults,
      performSearch
    }
  }
}
</script>
