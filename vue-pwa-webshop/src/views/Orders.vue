<template>
  <v-container>
    <h1 class="text-h3 mb-4">My Orders</h1>
    <v-row v-if="orders.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey">mdi-package-variant</v-icon>
        <h2 class="text-h4 mt-4">No orders yet</h2>
        <v-btn color="primary" size="large" class="mt-4" to="/products">Start Shopping</v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-card v-for="order in orders" :key="order.id" class="mb-4">
          <v-card-title>Order #{{ order.id }}</v-card-title>
          <v-card-text>
            <p>Status: {{ order.status }}</p>
            <p>Total: ${{ order.total }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'OrdersView',
  setup() {
    const orders = ref([])
    return { orders }
  }
}
</script>
