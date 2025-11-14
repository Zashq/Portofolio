<template>
  <v-container>
    <h1 class="text-h3 mb-4">Shopping Cart</h1>
    
    <!-- Empty Cart -->
    <v-row v-if="items.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey">mdi-cart-outline</v-icon>
        <h2 class="text-h4 mt-4">Your cart is empty</h2>
        <v-btn color="primary" size="large" class="mt-4" to="/products">
          Start Shopping
        </v-btn>
      </v-col>
    </v-row>

    <!-- Cart with Items -->
    <v-row v-else>
      <!-- Cart Items List -->
      <v-col cols="12" md="8">
        <v-card>
          <v-list>
            <v-list-item v-for="item in items" :key="item.id" class="py-3">
              <template v-slot:prepend>
                <v-avatar size="80" rounded>
                  <v-img :src="item.image" cover></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium mb-2">
                {{ item.title }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                <div class="d-flex align-center gap-2">
                  <span>Qty: {{ item.quantity }}</span>
                  <span class="mx-2">×</span>
                  <span class="font-weight-bold">€{{ item.price.toFixed(2) }}</span>
                </div>
                <div class="mt-2">
                  <span class="text-primary font-weight-bold">
                    Total: €{{ (item.price * item.quantity).toFixed(2) }}
                  </span>
                </div>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn 
                  icon 
                  color="error" 
                  variant="text"
                  @click="removeItem(item.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Order Summary (Subtotal Only) -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6">
            Cart Summary
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <!-- Item Count -->
            <div class="d-flex justify-space-between mb-3">
              <span class="text-grey">Items:</span>
              <span>{{ itemsCount }}</span>
            </div>

            <!-- Subtotal -->
            <div class="d-flex justify-space-between mb-4">
              <span class="text-h6">Subtotal:</span>
              <span class="text-h6 font-weight-bold">€{{ subtotal.toFixed(2) }}</span>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Info Note -->
            <v-alert 
              type="info" 
              variant="tonal" 
              density="compact"
              class="mb-4"
            >
              <div class="text-caption">
                Shipping and taxes calculated at checkout
              </div>
            </v-alert>

            <!-- Checkout Button -->
            <v-btn 
              color="primary" 
              size="large"
              block 
              to="/checkout"
            >
              <v-icon start>mdi-lock-outline</v-icon>
              Proceed to Checkout
            </v-btn>

            <!-- Continue Shopping -->
            <v-btn 
              variant="text" 
              block 
              class="mt-2"
              to="/products"
            >
              Continue Shopping
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed } from 'vue'
import { useCartStore } from '@/store/cart'

export default {
  name: 'CartView',
  setup() {
    const cartStore = useCartStore()
    
    const items = computed(() => cartStore.items)
    const subtotal = computed(() => cartStore.subtotal)
    const itemsCount = computed(() => cartStore.itemsCount)
    
    const removeItem = (id) => cartStore.removeItem(id)
    
    return { 
      items, 
      subtotal,
      itemsCount,
      removeItem 
    }
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
