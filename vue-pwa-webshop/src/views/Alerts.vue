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
          <v-icon start>mdi-information</v-icon>
          Set up alerts for your favorite products and we'll notify you when prices drop to your target.
          <template v-if="subscription">
            <br>
            <strong class="mt-2 d-block">
              Your plan: {{ subscription.tier || 'Free' }} 
              ({{ alerts.length }} / {{ alertLimit === -1 ? '∞' : alertLimit }} alerts used)
            </strong>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Loading your alerts...</p>
      </v-col>
    </v-row>

    <!-- Active Alerts -->
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Active Price Alerts</span>
            <v-btn color="primary" @click="goToProducts">
              <v-icon start>mdi-plus</v-icon>
              New Alert
            </v-btn>
          </v-card-title>

          <!-- Empty State -->
          <v-card-text v-if="alerts.length === 0" class="text-center py-12">
            <v-icon size="120" color="grey-lighten-2">mdi-bell-off</v-icon>
            <h3 class="text-h5 mt-4 mb-2">No active alerts</h3>
            <p class="text-grey mb-6">Browse products and set alerts to get notified when prices drop</p>
            <v-btn color="primary" @click="goToProducts">
              <v-icon start>mdi-magnify</v-icon>
              Browse Products
            </v-btn>
          </v-card-text>

          <!-- Alerts List -->
          <v-list v-else>
            <v-list-item
              v-for="alert in alerts"
              :key="alert.id"
              class="my-2"
            >
              <template v-slot:prepend>
                <v-avatar size="80" rounded="lg">
                  <v-img :src="alert.productImage" cover></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold mb-2">
                {{ alert.productTitle }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <div class="mt-2">
                  <v-chip size="small" color="primary" class="mr-2">
                    <v-icon start size="small">mdi-currency-usd</v-icon>
                    Current: ${{ alert.currentPrice.toFixed(2) }}
                  </v-chip>
                  <v-chip size="small" color="success">
                    <v-icon start size="small">mdi-target</v-icon>
                    Target: ${{ alert.targetPrice.toFixed(2) }}
                  </v-chip>
                </div>
                <p class="text-caption mt-2 text-grey">
                  <v-icon size="small">mdi-clock-outline</v-icon>
                  Created {{ formatDate(alert.createdAt) }}
                </p>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="confirmDelete(alert)"
                  :loading="deletingId === alert.id"
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
          <v-card-title>
            <v-icon start>mdi-bell-check</v-icon>
            Recent Notifications
          </v-card-title>
          
          <v-list v-if="triggeredAlerts.length > 0">
            <v-list-item
              v-for="notification in triggeredAlerts"
              :key="notification.id"
            >
              <template v-slot:prepend>
                <v-avatar color="success" size="40">
                  <v-icon color="white">mdi-trending-down</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium">
                {{ notification.productTitle }}
              </v-list-item-title>
              <v-list-item-subtitle class="mt-1">
                <span class="text-success font-weight-bold">
                  Price dropped from ${{ notification.oldPrice.toFixed(2) }} to 
                  ${{ notification.newPrice.toFixed(2) }}
                </span>
                <v-chip size="x-small" color="success" class="ml-2">
                  {{ notification.percentDrop.toFixed(1) }}% off
                </v-chip>
                <br>
                <span class="text-caption text-grey">
                  {{ formatDate(notification.createdAt) }}
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <v-card-text v-else class="text-center py-8">
            <v-icon size="60" color="grey-lighten-2">mdi-bell-sleep</v-icon>
            <p class="text-grey mt-2">No notifications yet</p>
            <p class="text-caption text-grey">
              You'll see price drop notifications here once they're triggered
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Alert?</v-card-title>
        <v-card-text>
          Are you sure you want to delete the price alert for "{{ alertToDelete?.productTitle }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteAlert">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import alertService from '@/services/alertService'

export default {
  name: 'AlertsView',
  setup() {
    const router = useRouter()
    const toast = useToast()
    
    const loading = ref(true)
    const alerts = ref([])
    const triggeredAlerts = ref([])
    const subscription = ref(null)
    const alertLimit = ref(3)
    const deleteDialog = ref(false)
    const alertToDelete = ref(null)
    const deletingId = ref(null)
    
    const loadAlerts = async () => {
      try {
        loading.value = true
        
        subscription.value = await alertService.getUserSubscription()
        alertLimit.value = alertService.getAlertLimit(subscription.value?.tier || 'free')
        
        alerts.value = await alertService.getUserAlerts()
        
        triggeredAlerts.value = await alertService.getTriggeredAlerts()
        
      } catch (error) {
        console.error('Error loading alerts:', error)
        toast.error('Failed to load alerts')
      } finally {
        loading.value = false
      }
    }
    
    const confirmDelete = (alert) => {
      alertToDelete.value = alert
      deleteDialog.value = true
    }
    
    const deleteAlert = async () => {
      if (!alertToDelete.value) return
      
      try {
        deletingId.value = alertToDelete.value.id
        await alertService.deleteAlert(alertToDelete.value.id)
        
        alerts.value = alerts.value.filter(a => a.id !== alertToDelete.value.id)
        
        toast.success('Alert deleted successfully')
        deleteDialog.value = false
        alertToDelete.value = null
      } catch (error) {
        console.error('Error deleting alert:', error)
        toast.error('Failed to delete alert')
      } finally {
        deletingId.value = null
      }
    }
    
    const goToProducts = () => {
      router.push('/products')
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (e) {
        return 'Unknown'
      }
    }
    
    onMounted(() => {
      loadAlerts()
    })
    
    return {
      loading,
      alerts,
      triggeredAlerts,
      subscription,
      alertLimit,
      deleteDialog,
      alertToDelete,
      deletingId,
      confirmDelete,
      deleteAlert,
      goToProducts,
      formatDate
    }
  }
}
</script>
