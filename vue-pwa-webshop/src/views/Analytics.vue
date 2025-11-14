<template>
  <v-container>
    <h1 class="text-h3 mb-4">Analytics</h1>

    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">mdi-cart</v-icon>
            <h3 class="text-h4 mt-2">
              {{ loading ? '...' : totalOrders }}
            </h3>
            <p>Total Orders</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="success">mdi-currency-eur</v-icon>
            <h3 class="text-h4 mt-2">
              {{ loading ? '...' : formatCurrency(totalSpent) }}
            </h3>
            <p>Total Spent</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/main'           
import { useUserStore } from '@/store/user'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default {
  name: 'AnalyticsView',
  setup () {
    const userStore = useUserStore()
    const user = computed(() => userStore.user)

    const loading = ref(true)
    const totalOrders = ref(0)
    const totalSpent = ref(0)

    onMounted(async () => {
      if (!user.value) {
        loading.value = false
        return
      }

      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.value.uid)
        )

        const snap = await getDocs(q)

        let ordersCount = 0
        let spent = 0

        snap.forEach(doc => {
          const data = doc.data()
          ordersCount++
          spent += Number(data.total) || 0
        })

        totalOrders.value = ordersCount
        totalSpent.value = spent
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        loading.value = false
      }
    })

    const formatCurrency = (value) => {
      const num = Number(value) || 0
      return num.toLocaleString(undefined, {
        style: 'currency',
        currency: 'EUR' 
      })
    }

    return {
      loading,
      totalOrders,
      totalSpent,
      formatCurrency
    }
  }
}
</script>
