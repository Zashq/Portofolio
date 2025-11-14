<template>
  <v-container>
    <h1 class="text-h3 mb-4">My Orders</h1>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate size="48" />
      </v-col>
    </v-row>

    <!-- No orders -->
    <v-row v-else-if="orders.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="120" color="grey">mdi-package-variant</v-icon>
        <h2 class="text-h4 mt-4">No orders yet</h2>
        <v-btn color="primary" size="large" class="mt-4" to="/products">
          Start Shopping
        </v-btn>
      </v-col>
    </v-row>

    <!-- Orders list -->
    <v-row v-else>
      <v-col cols="12">
        <v-card
          v-for="order in orders"
          :key="order.id"
          class="mb-4"
        >
          <v-card-title>
            Order #{{ order.orderId || order.id }}
          </v-card-title>
          <v-card-text>
            <p>Status: {{ order.status }}</p>
            <p>Total: {{ formatCurrency(order.total) }}</p>
            <p v-if="order.createdAt">
              Placed: {{ formatDate(order.createdAt) }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db, auth } from '@/main' 
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default {
  name: 'OrdersView',
  setup () {
    const orders = ref([])
    const loading = ref(true)

    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          orders.value = []
          loading.value = false
          return
        }

        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          )

          const snap = await getDocs(q)
          console.log('Orders size:', snap.size)

          orders.value = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } catch (err) {
          console.error('Failed to load orders:', err)
          orders.value = []
        } finally {
          loading.value = false
        }
      })
    })

    const formatCurrency = (value) => {
      const num = Number(value) || 0
      return num.toLocaleString(undefined, {
        style: 'currency',
        currency: 'EUR' 
      })
    }

    const formatDate = (ts) => {
      const date =
        ts && typeof ts.toDate === 'function'
          ? ts.toDate()
          : new Date(ts)

      return date.toLocaleString()
    }

    return {
      orders,
      loading,
      formatCurrency,
      formatDate
    }
  }
}
</script>
