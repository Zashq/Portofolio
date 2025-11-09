<template>
  <v-container>
    <h1 class="text-h3 mb-4">Shopping Cart</h1>
    <v-row v-if="items.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey">mdi-cart-outline</v-icon>
        <h2 class="text-h4 mt-4">Your cart is empty</h2>
        <v-btn color="primary" size="large" class="mt-4" to="/products">Start Shopping</v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card>
          <v-list>
            <v-list-item v-for="item in items" :key="item.id">
              <template v-slot:prepend>
                <v-avatar size="80"><v-img :src="item.image"></v-img></v-avatar>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>
                Qty: {{ item.quantity }} x ${{ item.price }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon color="error" @click="removeItem(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Order Summary</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Tax:</span>
              <span>${{ tax.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between font-weight-bold">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
            <v-btn color="primary" block class="mt-4" to="/checkout">Proceed to Checkout</v-btn>
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
    const tax = computed(() => cartStore.tax)
    const total = computed(() => cartStore.total)
    const removeItem = (id) => cartStore.removeItem(id)
    return { items, subtotal, tax, total, removeItem }
  }
}
</script>
