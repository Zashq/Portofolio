<template>
  <v-container>
    <!-- Debug Info (remove in production) -->
    <v-alert v-if="debugInfo" type="warning" dismissible class="mb-4">
      <strong>Debug Info:</strong> {{ debugInfo }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h3 mb-6">Checkout</h1>
        
        <v-stepper v-model="step" alt-labels>
          <v-stepper-header>
            <v-stepper-item 
              :complete="step > 1" 
              :value="1" 
              title="Shipping"
              icon="mdi-truck"
            ></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item 
              :complete="step > 2" 
              :value="2" 
              title="Payment"
              icon="mdi-credit-card"
            ></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item 
              :value="3" 
              title="Confirmation"
              icon="mdi-check-circle"
            ></v-stepper-item>
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: Shipping Information -->
            <v-stepper-window-item :value="1">
              <v-card flat class="pa-4">
                <v-card-title>Shipping Information</v-card-title>
                <v-card-text>
                  <v-form ref="shippingForm">
                    <v-text-field
                      v-model="shippingInfo.name"
                      label="Full Name"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-account"
                    ></v-text-field>

                    <v-text-field
                      v-model="shippingInfo.email"
                      label="Email"
                      :rules="[rules.required, rules.email]"
                      outlined
                      prepend-inner-icon="mdi-email"
                    ></v-text-field>

                    <v-text-field
                      v-model="shippingInfo.phone"
                      label="Phone Number"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-phone"
                    ></v-text-field>

                    <v-text-field
                      v-model="shippingInfo.address"
                      label="Street Address"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-home"
                    ></v-text-field>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="shippingInfo.city"
                          label="City"
                          :rules="[rules.required]"
                          outlined
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="shippingInfo.zipCode"
                          label="ZIP Code"
                          :rules="[rules.required]"
                          outlined
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="primary" 
                    size="large"
                    @click="proceedToPayment"
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
                <v-card-title>Payment Information</v-card-title>
                <v-card-text>
                  <v-alert type="info" variant="tonal" class="mb-4">
                    <v-icon start>mdi-information</v-icon>
                    <strong>Test Mode:</strong> Use card <code>4242 4242 4242 4242</code>, 
                    any future date, any 3 digits for CVC
                  </v-alert>

                  <!-- Loading state -->
                  <div v-if="stripeLoading" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                    <p class="mt-4">Loading payment form...</p>
                  </div>

                  <!-- Stripe Card Element -->
                  <div v-else class="stripe-card-wrapper">
                    <div id="card-element" class="stripe-card-element"></div>
                    <div v-if="cardError" class="error-message mt-2">
                      <v-icon size="small" color="error">mdi-alert-circle</v-icon>
                      {{ cardError }}
                    </div>
                  </div>

                  <v-checkbox
                    v-if="!stripeLoading"
                    v-model="savePaymentMethod"
                    label="Save payment method for future purchases"
                    class="mt-4"
                  ></v-checkbox>
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
                    :disabled="processing || stripeLoading"
                    @click="processPayment"
                  >
                    <v-icon start>mdi-lock</v-icon>
                    Pay ${{ cartStore.total.toFixed(2) }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-window-item>

            <!-- Step 3: Confirmation -->
            <v-stepper-window-item :value="3">
              <v-card flat class="pa-4 text-center">
                <v-icon size="120" color="success" class="mb-4">
                  mdi-check-circle
                </v-icon>
                <v-card-title class="text-h4 mb-2">
                  Order Confirmed!
                </v-card-title>
                <v-card-text>
                  <p class="text-h6 mb-4">
                    Thank you for your purchase!
                  </p>
                  <p class="mb-4">
                    Order ID: <strong>{{ orderId }}</strong>
                  </p>
                  <p>
                    A confirmation email has been sent to {{ shippingInfo.email }}
                  </p>
                </v-card-text>
                <v-card-actions class="justify-center">
                  <v-btn 
                    color="primary" 
                    size="large"
                    to="/orders"
                  >
                    View Orders
                  </v-btn>
                  <v-btn 
                    variant="outlined" 
                    size="large"
                    to="/products"
                  >
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
            <v-list>
              <v-list-item
                v-for="item in cartStore.items"
                :key="item.id"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-avatar size="50" rounded>
                    <v-img :src="item.image"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <span class="font-weight-bold">
                    ${{ (item.price * item.quantity).toFixed(2) }}
                  </span>
                </template>
              </v-list-item>
            </v-list>

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
              <span>Tax</span>
              <span>${{ (cartStore.total * 0.1).toFixed(2) }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'
import { loadStripe } from '@stripe/stripe-js'
import { db, auth, functions } from '@/main'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

export default {
  name: 'CheckoutView',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const toast = useToast()
    
    const step = ref(1)
    const processing = ref(false)
    const stripeLoading = ref(true)
    const cardError = ref('')
    const orderId = ref('')
    const savePaymentMethod = ref(false)
    const debugInfo = ref('')
    
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

    const rules = {
      required: value => !!value || 'This field is required',
      email: value => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Invalid email address'
      }
    }

    const grandTotal = computed(() => {
      return cartStore.total + 5.00 + (cartStore.total * 0.1)
    })

    const proceedToPayment = () => {
      if (!shippingInfo.value.name || !shippingInfo.value.email || 
          !shippingInfo.value.phone || !shippingInfo.value.address ||
          !shippingInfo.value.city || !shippingInfo.value.zipCode) {
        toast.error('Please fill in all shipping information')
        return
      }
      step.value = 2
      
      // Initialize Stripe when moving to payment step
      if (!stripe && !stripeLoading.value) {
        initializeStripe()
      }
    }

    const initializeStripe = async () => {
      console.log('🔧 Initializing Stripe...')
      stripeLoading.value = true
      
      try {
        // Check if Stripe key is available
        const stripeKey = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
        
        if (!stripeKey) {
          throw new Error('Stripe publishable key not found. Please add VUE_APP_STRIPE_PUBLISHABLE_KEY to your .env file')
        }

        console.log('✅ Stripe key found:', stripeKey.substring(0, 15) + '...')
        
        // Load Stripe
        stripe = await loadStripe(stripeKey)
        
        if (!stripe) {
          throw new Error('Failed to load Stripe. Please check your internet connection.')
        }

        console.log('✅ Stripe loaded successfully')
        
        // Wait a bit for the DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if card element container exists
        const cardContainer = document.getElementById('card-element')
        if (!cardContainer) {
          throw new Error('Card element container not found in DOM')
        }

        console.log('✅ Card container found')
        
        // Create card element
        const elements = stripe.elements()
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
              iconColor: '#f44336'
            },
          },
        })
        
        console.log('✅ Card element created')
        
        // Mount card element
        cardElement.mount('#card-element')
        
        console.log('✅ Card element mounted')
        
        // Listen for card errors
        cardElement.on('change', (event) => {
          cardError.value = event.error ? event.error.message : ''
        })

        stripeLoading.value = false
        console.log('✅ Stripe initialization complete')
        
      } catch (error) {
        console.error('❌ Stripe initialization error:', error)
        stripeLoading.value = false
        debugInfo.value = error.message
        toast.error(error.message || 'Failed to initialize payment system')
      }
    }

    const processPayment = async () => {
      if (!stripe || !cardElement) {
        toast.error('Payment system not ready. Please refresh the page.')
        return
      }

      processing.value = true
      cardError.value = ''

      try {
        console.log('💳 Processing payment...')
        
        // Create payment intent
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')
        
        const response = await createPaymentIntent({
          amount: grandTotal.value,
          currency: 'usd',
          metadata: {
            orderId: `ORDER-${Date.now()}`,
            items: JSON.stringify(cartStore.items.map(item => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity,
              price: item.price
            }))),
            shipping: JSON.stringify(shippingInfo.value)
          }
        })

        const { clientSecret } = response.data
        console.log('✅ Payment intent created')

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
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
          }
        )

        if (error) {
          throw new Error(error.message)
        }

        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment successful')
          
          // Save order to Firebase
          const user = auth.currentUser
          const orderData = {
            userId: user?.uid || 'guest',
            orderId: `ORDER-${Date.now()}`,
            paymentIntentId: paymentIntent.id,
            items: cartStore.items,
            shipping: shippingInfo.value,
            subtotal: cartStore.total,
            shippingCost: 5.00,
            tax: cartStore.total * 0.1,
            total: grandTotal.value,
            status: 'paid',
            createdAt: serverTimestamp()
          }

          const docRef = await addDoc(collection(db, 'orders'), orderData)
          orderId.value = docRef.id
          
          console.log('✅ Order saved:', orderId.value)

          // Clear cart
          cartStore.clearCart()
          
          // Move to confirmation
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
      
      // Check if cart is empty
      if (cartStore.items.length === 0) {
        toast.info('Your cart is empty')
        router.push('/products')
        return
      }
      
      console.log('Cart items:', cartStore.items.length)
    })

    onUnmounted(() => {
      console.log('🔄 Checkout page unmounted')
      if (cardElement) {
        cardElement.destroy()
        console.log('✅ Card element destroyed')
      }
    })

    return {
      step,
      shippingInfo,
      cartStore,
      processing,
      stripeLoading,
      cardError,
      orderId,
      savePaymentMethod,
      debugInfo,
      rules,
      grandTotal,
      proceedToPayment,
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

.stripe-card-element {
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
  font-family: 'Courier New', monospace;
}
</style>
