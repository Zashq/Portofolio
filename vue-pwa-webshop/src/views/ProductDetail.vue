<template>
  <v-container>
    <v-row v-if="loading" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Loading product...</p>
      </v-col>
    </v-row>
    
    <div v-else-if="product">
      <v-row>
        <!-- Product Image -->
        <v-col cols="12" md="6">
          <v-card elevation="0" class="pa-4">
            <v-img 
              :src="product.image" 
              max-height="500" 
              contain
              class="rounded"
            ></v-img>
          </v-card>
        </v-col>

        <!-- Product Details -->
        <v-col cols="12" md="6">
          <v-chip 
            class="mb-4" 
            color="primary" 
            variant="outlined"
          >
            {{ product.category }}
          </v-chip>
          
          <h1 class="text-h4 mb-4">{{ product.title }}</h1>
          
          <div class="d-flex align-center mb-4">
            <span class="text-h3 text-primary font-weight-bold">
              ${{ product.price.toFixed(2) }}
            </span>
            <v-chip 
              v-if="product.rating" 
              class="ml-4" 
              color="warning"
              prepend-icon="mdi-star"
            >
              {{ product.rating.rate }} ({{ product.rating.count }} reviews)
            </v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-2">Description</h3>
          <p class="text-body-1 mb-6">{{ product.description }}</p>

          <v-divider class="my-4"></v-divider>

          <!-- Action Buttons -->
          <div class="d-flex flex-wrap gap-3">
            <v-btn 
              color="primary" 
              size="x-large" 
              @click="addToCart"
              :prepend-icon="'mdi-cart-plus'"
            >
              Add to Cart
            </v-btn>

            <v-btn 
              color="success" 
              size="x-large" 
              variant="outlined"
              @click="showAlertDialog = true"
              :prepend-icon="'mdi-bell-ring'"
            >
              Set Price Alert
            </v-btn>
          </div>

          <!-- Already Has Alert Notice -->
          <v-alert 
            v-if="hasExistingAlert" 
            type="info" 
            variant="tonal"
            class="mt-4"
          >
            <v-icon start>mdi-bell-check</v-icon>
            You already have a price alert set for this product.
            <v-btn 
              variant="text" 
              color="primary" 
              class="ml-2"
              to="/alerts"
            >
              View Alerts
            </v-btn>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Price Alert Dialog -->
      <v-dialog v-model="showAlertDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon start color="success">mdi-bell-ring</v-icon>
            Set Price Alert
          </v-card-title>
          
          <v-card-text>
            <p class="mb-4">
              Get notified when <strong>{{ product.title }}</strong> drops to your target price.
            </p>

            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              Current price: <strong>${{ product.price.toFixed(2) }}</strong>
            </v-alert>

            <v-text-field
              v-model.number="targetPrice"
              label="Target Price"
              prefix="$"
              type="number"
              step="0.01"
              outlined
              :rules="[
                v => !!v || 'Target price is required',
                v => v > 0 || 'Price must be greater than 0',
                v => v < product.price || 'Target price must be lower than current price'
              ]"
              hint="You'll be notified when the price drops to or below this amount"
              persistent-hint
            ></v-text-field>

            <v-alert 
              v-if="alertError" 
              type="error" 
              density="compact"
              class="mt-4"
            >
              {{ alertError }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              variant="text" 
              @click="showAlertDialog = false"
              :disabled="creatingAlert"
            >
              Cancel
            </v-btn>
            <v-btn 
              color="success" 
              @click="createAlert"
              :loading="creatingAlert"
              :disabled="!targetPrice || targetPrice >= product.price"
            >
              <v-icon start>mdi-bell-plus</v-icon>
              Create Alert
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <v-icon size="120" color="error">mdi-alert-circle</v-icon>
      <h2 class="text-h4 mt-4 mb-2">Product Not Found</h2>
      <p class="text-grey mb-6">The product you're looking for doesn't exist.</p>
      <v-btn color="primary" to="/products">
        Browse Products
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/store/products'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'
import alertService from '@/services/alertService'
import { auth } from '@/main'

export default {
  name: 'ProductDetailView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const toast = useToast()
    
    const product = ref(null)
    const loading = ref(true)
    const showAlertDialog = ref(false)
    const targetPrice = ref(null)
    const creatingAlert = ref(false)
    const alertError = ref('')
    const hasExistingAlert = ref(false)
    
    const loadProduct = async () => {
      try {
        loading.value = true
        product.value = await productsStore.getProductById(route.params.id)
        
        if (product.value) {
          // Set suggested target price (10% less than current)
          targetPrice.value = (product.value.price * 0.9).toFixed(2)
          
          // Check if user already has an alert for this product
          await checkExistingAlert()
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Failed to load product')
      } finally {
        loading.value = false
      }
    }
    
    const checkExistingAlert = async () => {
      try {
        const user = auth.currentUser
        if (!user) return
        
        const alerts = await alertService.getUserAlerts()
        hasExistingAlert.value = alerts.some(
          alert => alert.productId === product.value.id.toString()
        )
      } catch (error) {
        console.error('Error checking existing alerts:', error)
      }
    }
    
    const addToCart = () => {
      cartStore.addItem(product.value)
      toast.success('Added to cart!')
    }
    
    const createAlert = async () => {
      if (!auth.currentUser) {
        toast.info('Please login to set price alerts')
        router.push('/login')
        return
      }

      if (!targetPrice.value || targetPrice.value >= product.value.price) {
        alertError.value = 'Target price must be lower than current price'
        return
      }

      try {
        creatingAlert.value = true
        alertError.value = ''
        
        await alertService.createAlert(
          product.value.id,
          product.value.title,
          product.value.image,
          product.value.price,
          parseFloat(targetPrice.value)
        )
        
        toast.success('Price alert created successfully!')
        showAlertDialog.value = false
        hasExistingAlert.value = true
        
      } catch (error) {
        console.error('Error creating alert:', error)
        alertError.value = error.message || 'Failed to create alert'
        
        if (error.message.includes('Upgrade to Premium')) {
          toast.error('Alert limit reached. Upgrade to Premium for unlimited alerts.')
        } else if (error.message.includes('already have an alert')) {
          toast.info('You already have an alert for this product')
          hasExistingAlert.value = true
          showAlertDialog.value = false
        } else {
          toast.error('Failed to create alert')
        }
      } finally {
        creatingAlert.value = false
      }
    }
    
    onMounted(() => {
      loadProduct()
    })
    
    return {
      product,
      loading,
      showAlertDialog,
      targetPrice,
      creatingAlert,
      alertError,
      hasExistingAlert,
      addToCart,
      createAlert
    }
  }
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
