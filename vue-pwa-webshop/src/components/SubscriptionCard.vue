<template>
  <v-card>
    <v-card-title>
      {{ plan.name }}
      <v-chip v-if="isCurrentPlan" color="success" size="small" class="ml-2">
        Current
      </v-chip>
    </v-card-title>
    
    <v-card-text>
      <div class="text-h4 mb-2">
        ${{ plan.price }}
        <span class="text-subtitle-1 text-grey">/month</span>
      </div>
      
      <v-list dense>
        <v-list-item v-for="(feature, index) in plan.features" :key="index">
          <template v-slot:prepend>
            <v-icon color="success">mdi-check</v-icon>
          </template>
          <v-list-item-title>{{ feature }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
    
    <v-card-actions>
      <v-btn
        v-if="!isCurrentPlan && plan.price > 0"
        color="primary"
        block
        :loading="loading"
        @click="subscribe"
      >
        Subscribe
      </v-btn>
      
      <v-btn
        v-else-if="isCurrentPlan && plan.price > 0"
        color="error"
        block
        :loading="loading"
        @click="cancel"
      >
        Cancel Subscription
      </v-btn>
      
      <v-btn
        v-else
        color="grey"
        block
        disabled
      >
        Free Plan
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue'
import stripeService from '@/services/stripeService'
import { useToast } from 'vue-toastification'

export default {
  name: 'SubscriptionCard',
  
  props: {
    plan: {
      type: Object,
      required: true
    },
    currentSubscription: {
      type: Object,
      default: null
    }
  },
  
  emits: ['subscription-updated'],
  
  setup(props, { emit }) {
    const toast = useToast()
    const loading = ref(false)
    
    const isCurrentPlan = computed(() => {
      return props.currentSubscription?.priceId === props.plan.priceId
    })
    
    const subscribe = async () => {
      loading.value = true
      try {
        await stripeService.createSubscription(props.plan.priceId)
        toast.success('Subscription activated!')
        emit('subscription-updated')
      } catch (error) {
        console.error('Subscription error:', error)
        toast.error('Failed to subscribe: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    const cancel = async () => {
      if (!confirm('Are you sure you want to cancel your subscription?')) {
        return
      }
      
      loading.value = true
      try {
        await stripeService.cancelSubscription(props.currentSubscription.id)
        toast.success('Subscription canceled')
        emit('subscription-updated')
      } catch (error) {
        console.error('Cancel error:', error)
        toast.error('Failed to cancel: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    return {
      loading,
      isCurrentPlan,
      subscribe,
      cancel
    }
  }
}
</script>
