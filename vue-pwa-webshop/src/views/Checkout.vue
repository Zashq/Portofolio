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
                    Test Mode: Card <code>4242 4242 4242 4242</code>, Exp <code>12/25</code>, CVC <code>123</code>
                  </v-alert>

                  <!-- Loading State -->
                  <div v-if="stripeLoading" class="text-center py-8">
                    <v-progress-circular 
                      indeterminate 
                      color="primary" 
                      size="48"
                    ></v-progress-circular>
                    <p class="mt-4">{{ loadingMessage }}</p>
                  </div>

                  <!-- Error State -->
                  <v-alert v-else-if="stripeError" type="error" class="mb-4">
                    <strong>Payment system error:</strong>
                    <p class="text-body-2 mt-1">{{ stripeError }}</p>
                    <v-btn 
                      variant="outlined" 
                      size="small" 
                      class="mt-2"
                      @click="retryStripeInit"
                    >
                      <v-icon start>mdi-refresh</v-icon>
                      Retry
                    </v-btn>
                  </v-alert>

                  <!-- Card Element - Always in DOM when on step 2 -->
                  <!-- KEEP THIS IN THE DOM; just hide when not active -->
                  <div v-show="step === 2">
                    <div class="stripe-card-wrapper">
                      <div id="stripe-card-element" class="card-element"></div>
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
                    @click="goBackToShipping"
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
    const loadingMessage = ref('Initializing...')
    const cardReady = ref(false)
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

    // Watch for step changes
    watch(step, async (newStep) => {
      if (newStep === 2 && !stripe) {
        // Wait for next tick to ensure DOM is updated
        await nextTick()
        // Add extra delay to be absolutely sure
        setTimeout(() => {
          initStripe()
        }, 300)
      }
    })

    // Continue to payment
    const continueToPayment = () => {
      // Validate shipping info
      if (!shippingInfo.value.name || !shippingInfo.value.email || 
          !shippingInfo.value.address || !shippingInfo.value.city || 
          !shippingInfo.value.zipCode) {
        toast.error('Please fill in all required fields')
        return
      }
      
      step.value = 2
    }

    // Go back to shipping
    const goBackToShipping = () => {
      step.value = 1
    }

    // Retry Stripe initialization
    const retryStripeInit = () => {
      stripeError.value = ''
      cardReady.value = false
      stripe = null
      elements = null
      cardElement = null
      
      setTimeout(() => {
        initStripe()
      }, 300)
    }

    // Wait for container to exist in DOM
    const waitForContainer = (selector, maxAttempts = 20) => {
      return new Promise((resolve, reject) => {
        let attempts = 0
        
        const checkContainer = () => {
          attempts++
          const container = document.querySelector(selector)
          
          if (container) {
            console.log(`✅ Container found after ${attempts} attempts`)
            resolve(container)
          } else if (attempts >= maxAttempts) {
            reject(new Error(`Container ${selector} not found after ${maxAttempts} attempts`))
          } else {
            console.log(`⏳ Waiting for container... (attempt ${attempts}/${maxAttempts})`)
            setTimeout(checkContainer, 100)
          }
        }
        
        checkContainer()
      })
    }

    // Initialize Stripe
    const initStripe = async () => {
      if (stripe) {
        console.log('✅ Stripe already initialized')
        return
      }

      console.log('🔧 Initializing Stripe...')
      stripeLoading.value = true
      stripeError.value = ''
      cardReady.value = false
      loadingMessage.value = 'Connecting to payment system...'
      
      try {
        // Check Stripe key
        const stripeKey = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey) {
          throw new Error('Stripe key not configured. Add VUE_APP_STRIPE_PUBLISHABLE_KEY to your .env file')
        }

        console.log('✅ Stripe key found:', stripeKey.substring(0, 15) + '...')
        loadingMessage.value = 'Loading Stripe...'

        // Load Stripe
        stripe = await loadStripe(stripeKey)
        if (!stripe) {
          throw new Error('Failed to load Stripe. Check your internet connection.')
        }

        console.log('✅ Stripe loaded')
        loadingMessage.value = 'Preparing payment form...'

        // Wait for container to be in DOM
        console.log('⏳ Waiting for container...')
        await waitForContainer('#stripe-card-element')

        console.log('✅ Container ready')
        loadingMessage.value = 'Creating payment form...'

        // Create elements
        elements = stripe.elements()
        cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#f44336',
            },
          },
        })

        console.log('✅ Card element created')
        loadingMessage.value = 'Mounting payment form...'

        // Mount card element
        cardElement.mount('#stripe-card-element')
        console.log('✅ Card element mounted')

        // Wait for ready event
        cardElement.on('ready', () => {
          console.log('✅ Card element ready for input')
          cardReady.value = true
          stripeLoading.value = false
          toast.success('Payment form ready!')
        })

        // Listen for changes
        cardElement.on('change', (event) => {
          cardError.value = event.error ? event.error.message : ''
        })

        console.log('✅ Stripe initialization complete')
        
      } catch (error) {
        console.error('❌ Stripe initialization error:', error)
        stripeLoading.value = false
        stripeError.value = error.message
        toast.error(error.message)
      }
    }

    // Process payment
    const processPayment = async () => {
      if (!stripe || !cardElement) {
        toast.error('Payment system not ready. Please try refreshing the page.')
        return
      }

      if (!cardReady.value) {
        toast.error('Card form is not ready. Please wait a moment.')
        return
      }

      processing.value = true
      cardError.value = ''

      try {
        console.log('💳 Starting payment process...')
        
        // Create payment intent
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')
        
        console.log('📦 Sending cart items to backend:', cartStore.items.length)
        
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

        // Create payment method from card
        console.log('💳 Creating payment method...')
        
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
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
        })

        if (pmError) {
          throw new Error(pmError.message)
        }

        console.log('✅ Payment method created')

        // Confirm payment
        console.log('🔒 Confirming payment...')
        
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: paymentMethod.id
          }
        )

        if (confirmError) {
          throw new Error(confirmError.message)
        }

        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment successful!')
          
          // Save order
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
          console.log('✅ Order saved:', orderId.value)
          
          // Clear cart and show success
          cartStore.clearCart()
          step.value = 3
          toast.success('Payment successful!')
        }
      } catch (error) {
        console.error('❌ Payment error:', error)
        cardError.value = error.message
        toast.error(error.message || 'Payment failed. Please try again.')
      } finally {
        processing.value = false
      }
    }

    onMounted(() => {
      console.log('🚀 Checkout page mounted')
      
      if (cartStore.items.length === 0) {
        toast.info('Your cart is empty')
        router.push('/products')
      }
    })

    onUnmounted(() => {
      console.log('🔄 Checkout unmounting')
      
      if (cardElement) {
        try {
          cardElement.destroy()
          console.log('✅ Card element destroyed')
        } catch (e) {
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
      goBackToShipping,
      retryStripeInit,
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

#stripe-card-element {
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
