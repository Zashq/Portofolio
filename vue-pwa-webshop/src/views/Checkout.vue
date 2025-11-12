<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h3 mb-6">Checkout</h1>
        
        <v-stepper v-model="step" alt-labels>
          <v-stepper-header>
            <v-stepper-item 
              :complete="step > 1" 
              :value="1" 
              title="Shipping"
            ></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item 
              :complete="step > 2" 
              :value="2" 
              title="Payment"
            ></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item 
              :value="3" 
              title="Confirmation"
            ></v-stepper-item>
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: Shipping Information -->
            <v-stepper-window-item :value="1">
              <v-card flat class="pa-4">
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
            </v-stepper-window-item>

            <!-- Step 2: Payment -->
            <v-stepper-window-item :value="2">
              <v-card flat class="pa-4">
                <v-card-title>Payment Method</v-card-title>
                <v-card-text>
                  <v-alert type="info" variant="tonal" class="mb-4">
                    <v-icon start>mdi-information</v-icon>
                    Test Mode: Use card <code>4242 4242 4242 4242</code>
                  </v-alert>

                  <!-- Loading State -->
                  <div v-if="loading" class="text-center py-8">
                    <v-progress-circular 
                      indeterminate 
                      color="primary" 
                      size="48"
                    ></v-progress-circular>
                    <p class="mt-4">Processing payment...</p>
                  </div>

                  <!-- Card Element Container (always in DOM) -->
                  <div v-else>
                    <!-- Stripe Initializing Overlay -->
                    <div v-if="!stripeReady" class="text-center py-8">
                      <v-progress-circular 
                        indeterminate 
                        color="primary" 
                        size="48"
                      ></v-progress-circular>
                      <p class="mt-4">Loading payment form...</p>
                    </div>
                    
                    <!-- Card Element (hidden during initialization) -->
                    <div 
                      id="card-element-container" 
                      class="stripe-card-wrapper"
                      :style="{ display: stripeReady ? 'block' : 'none' }"
                    >
                      <div id="card-element"></div>
                      <div v-if="cardError" class="error-message mt-2">
                        {{ cardError }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn 
                    variant="text" 
                    @click="step = 1"
                    :disabled="loading"
                  >
                    <v-icon start>mdi-arrow-left</v-icon>
                    Back
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="success" 
                    size="large"
                    :loading="loading"
                    :disabled="loading || !stripeReady"
                    @click="processPayment"
                  >
                    <v-icon start>mdi-lock</v-icon>
                    Pay ${{ grandTotal.toFixed(2) }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-window-item>

            <!-- Step 3: Success -->
            <v-stepper-window-item :value="3">
              <v-card flat class="pa-4 text-center">
                <v-icon size="120" color="success" class="mb-4">
                  mdi-check-circle
                </v-icon>
                <v-card-title class="text-h4 mb-2">
                  Order Confirmed!
                </v-card-title>
                <v-card-text>
                  <p class="text-h6 mb-4">Thank you for your purchase!</p>
                  <p class="mb-4">
                    Order ID: <strong>{{ orderId }}</strong>
                  </p>
                  <p>A confirmation email has been sent to {{ shippingInfo.email }}</p>
                </v-card-text>
                <v-card-actions class="justify-center">
                  <v-btn color="primary" size="large" to="/orders">
                    View Orders
                  </v-btn>
                  <v-btn variant="outlined" size="large" to="/products">
                    Continue Shopping
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-col>

      <!-- Order Summary -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Order Summary</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <!-- Cart Items -->
            <div v-for="item in cartStore.items" :key="item.id" class="mb-3">
              <div class="d-flex align-center">
                <v-img 
                  :src="item.image" 
                  width="60" 
                  height="60" 
                  class="rounded mr-3"
                ></v-img>
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

            <!-- Totals -->
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
    const loading = ref(false)
    const stripeReady = ref(false)
    const cardError = ref('')
    const orderId = ref('')
    
    let stripe = null
    let elements = null
    let cardElement = null
    
    const shippingInfo = ref({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    })

    // Computed values
    const tax = computed(() => cartStore.total * 0.1)
    const grandTotal = computed(() => cartStore.total + 5.00 + tax.value)

    // Continue to payment
    const continueToPayment = async () => {
      // Validate shipping info
      if (!shippingInfo.value.name || !shippingInfo.value.email || 
          !shippingInfo.value.address || !shippingInfo.value.city || 
          !shippingInfo.value.zipCode) {
        toast.error('Please fill in all required fields')
        return
      }
      
      step.value = 2
      
      // Wait for Vue to update the DOM, then initialize Stripe
      await nextTick()
      setTimeout(() => {
        initStripe()
      }, 300)
    }

    // Initialize Stripe
    const initStripe = async () => {
      try {
        console.log('Initializing Stripe...')
        stripeReady.value = false
        
        const stripeKey = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey) {
          throw new Error('Stripe key not configured')
        }

        stripe = await loadStripe(stripeKey)
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 300))

        // Check if container exists
        const container = document.getElementById('card-element')
        if (!container) {
          console.error('Container not found in DOM')
          throw new Error('Card element container not found')
        }

        console.log('✅ Container found, creating card element...')

        // Create elements and card element
        elements = stripe.elements()
        cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#f44336',
            },
          },
        })

        // Mount the card element
        cardElement.mount('#card-element')
        
        // Wait for mount to complete
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Add event listener for card changes
        cardElement.on('change', (event) => {
          cardError.value = event.error ? event.error.message : ''
        })

        // Mark as ready
        stripeReady.value = true
        console.log('✅ Stripe initialized and mounted successfully')
        
      } catch (error) {
        console.error('Stripe initialization error:', error)
        toast.error(error.message || 'Failed to initialize payment system')
        step.value = 1
      }
    }

    // Process payment
    const processPayment = async () => {
      // Validate stripe is ready
      if (!stripe || !cardElement || !stripeReady.value) {
        toast.error('Payment system not ready. Please try again.')
        return
      }

      loading.value = true
      cardError.value = ''

      try {
        console.log('Creating payment intent...')
        
        // Call Firebase Function with ITEMS (not just amount)
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
        console.log('✅ Payment intent created')

        // Confirm payment with proper error handling
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingInfo.value.name,
              email: shippingInfo.value.email,
              phone: shippingInfo.value.phone,
              address: {
                line1: shippingInfo.value.address,
                city: shippingInfo.value.city,
                postal_code: shippingInfo.value.zipCode
              }
            }
          }
        })

        if (result.error) {
          throw new Error(result.error.message)
        }

        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          console.log('✅ Payment successful')
          
          // Save order
          const user = auth.currentUser
          const orderDoc = await addDoc(collection(db, 'orders'), {
            userId: user?.uid || 'guest',
            orderId: `ORDER-${Date.now()}`,
            paymentIntentId: result.paymentIntent.id,
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
          
          // Clear cart and move to success
          cartStore.clearCart()
          step.value = 3
          toast.success('Payment successful!')
        }
      } catch (error) {
        console.error('Payment error:', error)
        cardError.value = error.message
        toast.error(error.message || 'Payment failed')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (cartStore.items.length === 0) {
        toast.info('Your cart is empty')
        router.push('/products')
      }
    })

    onUnmounted(() => {
      // Clean up Stripe elements
      if (cardElement) {
        try {
          cardElement.destroy()
        } catch (error) {
          console.error('Error destroying card element:', error)
        }
      }
    })

    return {
      step,
      loading,
      stripeReady,
      cardError,
      orderId,
      shippingInfo,
      cartStore,
      tax,
      grandTotal,
      continueToPayment,
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

#card-element {
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
