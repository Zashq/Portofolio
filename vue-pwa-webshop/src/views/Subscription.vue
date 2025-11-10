<template>
  <v-container>
    <h1 class="mb-6">Alert Subscriptions</h1>
    
    <v-alert type="info" variant="tonal" class="mb-6">
      Choose a plan to get more price alerts and notifications!
    </v-alert>
    
    <v-row>
      <v-col 
        v-for="plan in plans" 
        :key="plan.id"
        cols="12"
        md="4"
      >
        <SubscriptionCard
          :plan="plan"
          :current-subscription="currentSubscription"
          @subscription-updated="loadSubscription"
        />
      </v-col>
    </v-row>
    
    <v-card class="mt-6" v-if="currentSubscription">
      <v-card-title>Current Subscription Details</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>Plan</v-list-item-title>
            <v-list-item-subtitle>
              {{ currentSubscription.planName }}
            </v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-title>Status</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="statusColor" size="small">
                {{ currentSubscription.status }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item v-if="currentSubscription.currentPeriodEnd">
            <v-list-item-title>Next Billing Date</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(currentSubscription.currentPeriodEnd) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import SubscriptionCard from '@/components/SubscriptionCard.vue'
import stripeService from '@/services/stripeService'
import { useToast } from 'vue-toastification'

export default {
  name: 'SubscriptionView',
  
  components: {
    SubscriptionCard
  },
  
  setup() {
    const toast = useToast()
    const currentSubscription = ref(null)
    
    // ⚠️ IMPORTANT: Replace these with your actual Stripe Price IDs
    // Get them from: https://dashboard.stripe.com/test/products
    const plans = ref([
      {
        id: 'free',
        name: 'Basic Alerts',
        price: 0,
        priceId: price_1SRyZ6EbxhcGhVZMMhemN4bJ,
        features: [
          'Up to 3 price alerts',
          'Email notifications',
          'Basic support'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Alerts',
        price: 4.99,
        priceId: 'price_REPLACE_WITH_YOUR_PREMIUM_PRICE_ID', // ⚠️ REPLACE THIS
        features: [
          'Unlimited price alerts',
          'Email notifications',
          'Priority support',
          'Advanced analytics'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Alerts',
        price: 9.99,
        priceId: 'price_REPLACE_WITH_YOUR_PRO_PRICE_ID', // ⚠️ REPLACE THIS
        features: [
          'Everything in Premium',
          'SMS notifications',
          'Phone support',
          'Custom alert rules',
          'API access'
        ]
      }
    ])
    
    const statusColor = computed(() => {
      if (!currentSubscription.value) return 'grey'
      
      switch (currentSubscription.value.status) {
        case 'active':
          return 'success'
        case 'canceled':
          return 'error'
        case 'past_due':
          return 'warning'
        default:
          return 'grey'
      }
    })
    
    const loadSubscription = async () => {
      try {
        const subscriptions = await stripeService.getSubscriptions()
        if (subscriptions && subscriptions.length > 0) {
          currentSubscription.value = subscriptions[0]
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
      }
    }
    
    const formatDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleDateString()
    }
    
    onMounted(() => {
      loadSubscription()
    })
    
    return {
      plans,
      currentSubscription,
      statusColor,
      loadSubscription,
      formatDate
    }
  }
}
</script>
