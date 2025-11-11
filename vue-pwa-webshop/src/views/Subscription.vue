<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-2">Alert Subscription Plans</h1>
        <p class="text-h6 text-grey mb-6">
          Choose the plan that fits your needs
        </p>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Free Plan -->
      <v-col cols="12" md="4">
        <v-card 
          :class="{ 'border-primary': currentTier === 'free' }"
          class="h-100"
          elevation="2"
        >
          <v-card-title class="text-center bg-grey-lighten-4 pa-4">
            <div>
              <v-icon size="48" color="grey">mdi-bell-outline</v-icon>
              <h2 class="text-h5 mt-2">Basic</h2>
              <p class="text-h3 font-weight-bold mt-2">Free</p>
            </div>
          </v-card-title>

          <v-card-text class="pt-6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Up to 3 price alerts</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Email notifications</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Daily price checks</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Basic support</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn 
              v-if="currentTier === 'free'"
              block
              color="grey"
              variant="outlined"
              disabled
            >
              Current Plan
            </v-btn>
            <v-btn 
              v-else
              block
              color="primary"
              variant="outlined"
              @click="changeTier('free')"
              :loading="changing"
            >
              Downgrade to Free
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Premium Plan -->
      <v-col cols="12" md="4">
        <v-card 
          :class="{ 'border-primary': currentTier === 'premium' }"
          class="h-100"
          elevation="8"
        >
          <v-card-title class="text-center bg-primary pa-4">
            <div class="text-white">
              <v-chip color="white" size="small" class="mb-2">POPULAR</v-chip>
              <v-icon size="48" color="white">mdi-bell-ring</v-icon>
              <h2 class="text-h5 mt-2">Premium</h2>
              <p class="text-h3 font-weight-bold mt-2">$4.99<span class="text-subtitle-1">/mo</span></p>
            </div>
          </v-card-title>

          <v-card-text class="pt-6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">
                  Unlimited price alerts
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Email & push notifications</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Hourly price checks</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Priority support</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Price history charts</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn 
              v-if="currentTier === 'premium'"
              block
              color="primary"
              disabled
            >
              <v-icon start>mdi-check</v-icon>
              Current Plan
            </v-btn>
            <v-btn 
              v-else
              block
              color="primary"
              @click="changeTier('premium')"
              :loading="changing"
            >
              Upgrade to Premium
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Pro Plan -->
      <v-col cols="12" md="4">
        <v-card 
          :class="{ 'border-primary': currentTier === 'pro' }"
          class="h-100"
          elevation="2"
        >
          <v-card-title class="text-center bg-gradient pa-4">
            <div class="text-white">
              <v-icon size="48" color="white">mdi-star</v-icon>
              <h2 class="text-h5 mt-2">Pro</h2>
              <p class="text-h3 font-weight-bold mt-2">$9.99<span class="text-subtitle-1">/mo</span></p>
            </div>
          </v-card-title>

          <v-card-text class="pt-6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">
                  Everything in Premium
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Real-time price tracking</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Advanced analytics</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>API access</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Dedicated support</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Custom alerts</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn 
              v-if="currentTier === 'pro'"
              block
              color="primary"
              disabled
            >
              <v-icon start>mdi-check</v-icon>
              Current Plan
            </v-btn>
            <v-btn 
              v-else
              block
              color="primary"
              variant="elevated"
              @click="changeTier('pro')"
              :loading="changing"
            >
              Upgrade to Pro
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Current Subscription Info -->
    <v-row class="mt-6" v-if="subscription">
      <v-col cols="12">
        <v-card color="blue-lighten-5">
          <v-card-title>
            <v-icon start>mdi-information</v-icon>
            Your Subscription
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <strong>Current Plan:</strong> 
                <v-chip :color="tierColor" class="ml-2" size="small">
                  {{ currentTier.toUpperCase() }}
                </v-chip>
              </v-col>
              <v-col cols="12" md="4">
                <strong>Alerts Used:</strong> 
                {{ alertsUsed }} / {{ alertLimit === -1 ? '∞' : alertLimit }}
              </v-col>
              <v-col cols="12" md="4" v-if="subscription.nextBillingDate">
                <strong>Next Billing:</strong> 
                {{ formatDate(subscription.nextBillingDate) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import alertService from '@/services/alertService'
import { auth, db } from '@/main'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default {
  name: 'SubscriptionView',
  setup() {
    const router = useRouter()
    const toast = useToast()
    
    const subscription = ref(null)
    const currentTier = ref('free')
    const alertsUsed = ref(0)
    const changing = ref(false)

    const alertLimit = computed(() => {
      return alertService.getAlertLimit(currentTier.value)
    })

    const tierColor = computed(() => {
      const colors = {
        free: 'grey',
        premium: 'primary',
        pro: 'purple'
      }
      return colors[currentTier.value] || 'grey'
    })

    const loadSubscription = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          toast.info('Please login to manage subscriptions')
          router.push('/login')
          return
        }

        subscription.value = await alertService.getUserSubscription()
        currentTier.value = subscription.value?.tier || 'free'
        
        // Get alerts count
        const alerts = await alertService.getUserAlerts()
        alertsUsed.value = alerts.length
        
      } catch (error) {
        console.error('Error loading subscription:', error)
      }
    }

    const changeTier = async (newTier) => {
      const user = auth.currentUser
      if (!user) {
        toast.info('Please login to change subscription')
        router.push('/login')
        return
      }

      try {
        changing.value = true

        // Update user's tier in Firestore
        await setDoc(
          doc(db, 'users', user.uid),
          {
            userId: user.uid,
            tier: newTier,
            updatedAt: serverTimestamp(),
            nextBillingDate: newTier !== 'free' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : null
          },
          { merge: true }
        )

        currentTier.value = newTier
        
        if (newTier === 'free') {
          toast.success('Downgraded to Free plan')
        } else {
          toast.success(`Upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} plan!`)
        }

        await loadSubscription()

      } catch (error) {
        console.error('Error changing tier:', error)
        toast.error('Failed to change subscription')
      } finally {
        changing.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      loadSubscription()
    })

    return {
      subscription,
      currentTier,
      alertsUsed,
      alertLimit,
      tierColor,
      changing,
      changeTier,
      formatDate
    }
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.border-primary {
  border: 3px solid rgb(var(--v-theme-primary));
}
</style>
