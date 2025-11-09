<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Price Alerts</h1>
        <p class="text-subtitle-1 text-grey">Get notified when prices drop</p>
      </v-col>
    </v-row>

    <!-- Info Card -->
    <v-row>
      <v-col cols="12">
        <v-alert type="info" variant="tonal" class="mb-4">
          <v-icon left>mdi-information</v-icon>
          Set up alerts for your favorite products and we'll notify you when prices drop to your target.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Active Alerts -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Active Price Alerts</span>
            <v-btn color="primary" @click="showCreateDialog = true">
              <v-icon left>mdi-plus</v-icon>
              New Alert
            </v-btn>
          </v-card-title>

          <!-- Empty State -->
          <v-card-text v-if="alerts.length === 0" class="text-center py-12">
            <v-icon size="120" color="grey-lighten-2">mdi-bell-off</v-icon>
            <h3 class="text-h5 mt-4 mb-2">No active alerts</h3>
            <p class="text-grey mb-6">Create your first price alert to get started</p>
            <v-btn color="primary" @click="showCreateDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Create Alert
            </v-btn>
          </v-card-text>

          <!-- Alerts List -->
          <v-list v-else>
            <v-list-item
              v-for="alert in alerts"
              :key="alert.id"
            >
              <template v-slot:prepend>
                <v-avatar size="60" rounded>
                  <v-img :src="alert.productImage"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ alert.productTitle }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <div class="mt-2">
                  <v-chip size="small" color="primary" class="mr-2">
                    Current: ${{ alert.currentPrice.toFixed(2) }}
                  </v-chip>
                  <v-chip size="small" color="success">
                    Target: ${{ alert.targetPrice.toFixed(2) }}
                  </v-chip>
                </div>
                <p class="text-caption mt-1">
                  Created {{ formatDate(alert.createdAt) }}
                </p>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="deleteAlert(alert.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Triggered Alerts History -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Notifications</v-card-title>
          <v-list v-if="triggeredAlerts.length > 0">
            <v-list-item
              v-for="alert in triggeredAlerts"
              :key="alert.id"
            >
              <template v-slot:prepend>
                <v-icon color="success">mdi-bell-check</v-icon>
              </template>
              <v-list-item-title>{{ alert.productTitle }}</v-list-item-title>
              <v-list-item-subtitle>
                Price dropped from ${{ alert.oldPrice.toFixed(2) }} to 
                ${{ alert.newPrice.toFixed(2) }} ({{ alert.percentDrop.toFixed(1) }}% off)
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center py-8">
            <p class="text-grey">No notifications yet</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create Alert Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create Price Alert</v-card-title>
        <v-card-text>
          <p class="text-caption text-grey mb-4">
            Browse products and click "Set Alert" on any product detail page
          </p>
          <v-btn color="primary" block to="/products">
            Browse Products
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'AlertsView',
  setup() {
    const toast = useToast()
    
    const alerts = ref([
      {
        id: '1',
        productTitle: 'Fjallraven Backpack',
        productImage: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        currentPrice: 109.95,
        targetPrice: 89.99,
        createdAt: new Date('2025-01-01').toISOString()
      }
    ])
    
    const triggeredAlerts = ref([])
    const showCreateDialog = ref(false)
    
    const deleteAlert = (id) => {
      alerts.value = alerts.value.filter(a => a.id !== id)
      toast.success('Alert deleted')
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    return {
      alerts,
      triggeredAlerts,
      showCreateDialog,
      deleteAlert,
      formatDate
    }
  }
}
</script>
