<template>
  <v-container>
    <v-row v-if="loading" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Loading...</p>
      </v-col>
    </v-row>
    <div v-else-if="product">
      <v-row>
        <v-col cols="12" md="6">
          <v-img :src="product.image" max-height="500" contain></v-img>
        </v-col>
        <v-col cols="12" md="6">
          <h1 class="text-h4 mb-4">{{ product.title }}</h1>
          <p class="text-h3 mb-4">${{ product.price }}</p>
          <p>{{ product.description }}</p>
          <v-btn color="primary" size="large" class="mt-4" @click="addToCart">
            <v-icon left>mdi-cart-plus</v-icon>Add to Cart
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/store/products'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'

export default {
  name: 'ProductDetailView',
  setup() {
    const route = useRoute()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const toast = useToast()
    const product = ref(null)
    const loading = ref(true)
    
    onMounted(async () => {
      product.value = await productsStore.getProductById(route.params.id)
      loading.value = false
    })
    
    const addToCart = () => {
      cartStore.addItem(product.value)
      toast.success('Added to cart!')
    }
    
    return { product, loading, addToCart }
  }
}
</script>
