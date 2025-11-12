<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h3 mb-6">Checkout</h1>
        
        <!-- Progress -->
        <div class="mb-6">
          <v-chip :color="step >= 1 ? 'primary' : 'grey'" class="mr-2">
            {{ step > 1 ? '✓' : '1' }} Shipping
          </v-chip>
          <v-chip :color="step >= 2 ? 'primary' : 'grey'" class="mr-2">
            {{ step > 2 ? '✓' : '2' }} Payment
          </v-chip>
          <v-chip :color="step >= 3 ? 'primary' : 'grey'">
            {{ step >= 3 ? '✓' : '3' }} Confirmation
          </v-chip>
        </div>

        <!-- Step 1: Shipping -->
        <v-card v-show="step === 1" flat class="pa-4 mb-4">
          <v-card-title>Shipping Information</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="shippingInfo.name"
              label="Full Name"
              outlined
              required
            ></v-text-field>

            <v-text-field
              v-model="shippingInfo.email"
              label="Email"
              type="email"
              outlined
              required
            ></v-text-field>

            <v-text-field
              v-model="shippingInfo.phone"
              label="Phone Number"
              outlined
              required
            ></v-text-field>

            <v-text-field
              v-model="shippingInfo.address"
              label="Street Address"
              outlined
              required
            ></v-text-field>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="shippingInfo.city"
                  label="City"
                  outlined
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="shippingInfo.zipCode"
                  label="ZIP Code"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              size="large"
              @click="continueToPayment"
            >
              Continue to Payment
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Step 2: Payment -->
        <v-card v-show="step === 2" flat class="pa-4 mb-4">
          <v-card-title>Payment Method</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              <v-icon start>mdi-information</v-icon>
              Test: <code>4242 4242 4242 4242</code>, Exp: <code>12/25</code>, CVC: <code>123</code>
            </v-alert>

            <!-- Loading -->
            <div v-if="stripeLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
              <p class="mt-4">{{ loadingMessage }}</p>
            </div>

            <!-- Error -->
            <v-alert v-else-if="stripeError" type="error" class="mb-4">
              <strong>Error:</strong> {{ stripeError }}
              <v-btn 
                variant="outlined" 
                size="small" 
                class="mt-2"
                @click="retryStripe"
              >
                <v-icon start>mdi-refresh</v-icon>
                Retry
              </v-btn>
            </v-alert>

            <!-- Card Element -->
            <div v-else>
              <div class="stripe-card-wrapper">
                <div id="stripe-card"></div>
              </div>
              <div v-if="cardError" class="error-message mt-2">
                <v-icon size="small" color="error">mdi-alert-circle</v-icon>
                {{ cardError }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn 
              variant="text" 
              @click="step = 1"
              :disabled="processing"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Back
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn 
              color="success" 
              size="large"
              :loading="processing"
              :disabled="processing || stripeLoading || !cardReady"
              @click="processPayment"
            >
              <v-icon start>mdi-lock</v-icon>
              Pay ${{ grandTotal.toFixed(2) }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Step 3: Success -->
        <v-card v-show="step === 3" flat class="pa-4 text-center">
          <v-icon size="120" color="success" class="mb-4">
            mdi-check-circle
          </v-icon>
          <v-card-title class="text-h4 mb-2">
            Order Confirmed!
          </v-card-title>
          <v-card-text>
            <p class="text-h6 mb-4">Thank you for your purchase!</p>
            <p class="mb-4">Order ID: <strong>{{ orderId }}</strong></p>
            <p>Confirmation sent to {{ shippingInfo.email }}</p>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn color="primary" size="large" to="/orders">View Orders</v-btn>
            <v-btn variant="outlined" size="large" to="/products">Continue Shopping</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Order Summary -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Order Summary</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <div v-for="item in cartStore.items" :key="item.id" class="mb-3">
              <div class="d-flex align-center">
                <v-img :src="item.image" width="60" height="60" class="rounded mr-3"></v-img>
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ item.title }}</div>
                  <div class="text-caption">Qty: {{ item.quantity }}</div>
                </div>
                <div class="font-weight-bold">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-space-between mb-2">
              <span>Subtotal</span>
              <span>${{ cartStore.total.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Shipping</span>
              <span>$5.00</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Tax (10%)</span>
              <span>${{ tax.toFixed(2) }}</span>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-space-between text-h6 font-weight-bold">
              <span>Total</span>
              <span>${{ grandTotal.toFixed(2) }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'
import { loadStripe } from '@stripe/stripe-js'
import { functions, db, auth } from '@/main'
import { httpsCallable } from 'firebase/functions'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default {
  name: 'CheckoutView',
  
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const toast = useToast()
    
    const step = ref(1)
    const processing = ref(false)
    const stripeLoading = ref(false)
    const stripeError = ref('')
    const loadingMessage = ref('')
    const cardReady = ref(false)
    const cardError = ref('')
    const orderId = ref('')
    
    let stripe = null
    let cardElement = null
    
    const shippingInfo = ref({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    })

    const tax = computed(() => cartStore.total * 0.1)
    const grandTotal = computed(() => cartStore.total + 5.00 + tax.value)

    // Move to payment step AND initialize Stripe
    const continueToPayment = async () => {
      if (!shippingInfo.value.name || !shippingInfo.value.email || 
          !shippingInfo.value.address || !shippingInfo.value.city || 
          !shippingInfo.value.zipCode) {
        toast.error('Please fill in all required fields')
        return
      }
      
      console.log('✅ Moving to step 2')
      step.value = 2
      
      // Wait for Vue to render step 2
      await nextTick()
      console.log('✅ nextTick complete')
      
      // Small delay for DOM to be ready
      setTimeout(() => {
        console.log('⏰ Now initializing Stripe...')
        initStripe()
      }, 500)
    }

    const retryStripe = () => {
      console.log('🔄 Retrying...')
      stripeError.value = ''
      cardReady.value = false
      stripe = null
      cardElement = null
      setTimeout(() => initStripe(), 300)
    }

    const initStripe = async () => {
      if (stripe) {
        console.log('⚠️ Already initialized')
        return
      }

      console.log('🔧 Initializing Stripe...')
      stripeLoading.value = true
      stripeError.value = ''
      cardReady.value = false
      loadingMessage.value = 'Loading payment system...'
      
      try {
        const stripeKey = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey) {
          throw new Error('Stripe key missing from .env')
        }
        console.log('✅ Key found')

        loadingMessage.value = 'Loading Stripe...'
        stripe = await loadStripe(stripeKey)
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }
        console.log('✅ Stripe loaded')

        // Wait for container
        loadingMessage.value = 'Preparing form...'
        let container = null
        for (let i = 0; i < 30; i++) {
          container = document.getElementById('stripe-card')
          if (container) {
            console.log(`✅ Container found (attempt ${i + 1})`)
            break
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        if (!container) {
          throw new Error('Payment form did not load. Please refresh the page.')
        }

        // Create element
        loadingMessage.value = 'Creating form...'
        const elements = stripe.elements()
        cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#f44336' },
          },
        })
        console.log('✅ Element created')

        // Mount
        loadingMessage.value = 'Mounting form...'
        cardElement.mount('#stripe-card')
        console.log('✅ Mounted')

        cardElement.on('ready', () => {
          console.log('✅ Ready!')
          cardReady.value = true
          stripeLoading.value = false
          toast.success('Payment form ready!')
        })

        cardElement.on('change', (event) => {
          cardError.value = event.error ? event.error.message : ''
        })

      } catch (error) {
        console.error('❌ Error:', error)
        stripeLoading.value = false
        stripeError.value = error.message
        toast.error(error.message)
      }
    }

    const processPayment = async () => {
      if (!stripe || !cardElement) {
        toast.error('Not ready')
        return
      }

      processing.value = true
      cardError.value = ''

      try {
        console.log('💳 Creating intent...')
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')
        const response = await createPaymentIntent({
          items: cartStore.items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shipping: shippingInfo.value
        })

        const { clientSecret } = response.data
        console.log('✅ Intent created')

        console.log('💳 Creating method...')
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: shippingInfo.value.name,
            email: shippingInfo.value.email,
            phone: shippingInfo.value.phone
          }
        })

        if (pmError) throw new Error(pmError.message)
        console.log('✅ Method created')

        console.log('🔒 Confirming...')
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: paymentMethod.id }
        )

        if (confirmError) throw new Error(confirmError.message)

        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Success!')
          
          const user = auth.currentUser
          const orderDoc = await addDoc(collection(db, 'orders'), {
            userId: user?.uid || 'guest',
            orderId: `ORDER-${Date.now()}`,
            paymentIntentId: paymentIntent.id,
            items: cartStore.items,
            shipping: shippingInfo.value,
            subtotal: cartStore.total,
            shippingCost: 5.00,
            tax: tax.value,
            total: grandTotal.value,
            status: 'paid',
            createdAt: serverTimestamp()
          })

          orderId.value = orderDoc.id
          cartStore.clearCart()
          step.value = 3
          toast.success('Payment successful!')
        }
      } catch (error) {
        console.error('❌ Payment error:', error)
        cardError.value = error.message
        toast.error(error.message)
      } finally {
        processing.value = false
      }
    }

    onMounted(() => {
      console.log('🚀 Mounted')
      
      if (cartStore.items.length === 0) {
        toast.info('Cart is empty')
        router.push('/products')
      }
      
      // Don't initialize Stripe here!
      // It will be initialized when user clicks "Continue"
    })

    onUnmounted(() => {
      console.log('👋 Unmounting')
      if (cardElement) {
        try {
          cardElement.destroy()
        } catch (e) {
          // Element already destroyed
          console.log('Card element already destroyed')
        }
      }
    })

    return {
      step,
      processing,
      stripeLoading,
      stripeError,
      loadingMessage,
      cardReady,
      cardError,
      orderId,
      shippingInfo,
      cartStore,
      tax,
      grandTotal,
      continueToPayment,
      retryStripe,
      processPayment
    }
  }
}
</script>

<style scoped>
.stripe-card-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  background: white;
  min-height: 60px;
}

#stripe-card {
  min-height: 40px;
}

.error-message {
  color: #f44336;
  font-size: 14px;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}
</style>
