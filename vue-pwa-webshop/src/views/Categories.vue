<template>
  <v-container>
    <h1 class="text-h3 mb-4">Categories</h1>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center"><v-progress-circular indeterminate></v-progress-circular></v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="category in categories" :key="category" cols="12" sm="6" md="3">
        <v-card @click="$router.push(`/category/${category}`)" hover>
          <v-card-text class="text-center">
            <v-icon size="64" color="primary">mdi-tag</v-icon>
            <h3 class="text-h6 mt-2 text-capitalize">{{ category }}</h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/store/products'

export default {
  name: 'CategoriesView',
  setup() {
    const productsStore = useProductsStore()
    const categories = ref([])
    const loading = ref(true)
    
    onMounted(async () => {
      await productsStore.loadCategories()
      categories.value = productsStore.categories
      loading.value = false
    })
    
    return { categories, loading }
  }
}
</script>
