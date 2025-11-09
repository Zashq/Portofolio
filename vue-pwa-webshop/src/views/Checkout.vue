<template>
  <v-container>
    <h1 class="text-h3 mb-4">Checkout</h1>
    <v-stepper v-model="step" alt-labels>
      <v-stepper-header>
        <v-stepper-item :complete="step > 1" :value="1" title="Shipping"></v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item :complete="step > 2" :value="2" title="Payment"></v-stepper-item>
      </v-stepper-header>
      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card flat>
            <v-card-text>
              <v-text-field v-model="shippingInfo.name" label="Full Name" outlined></v-text-field>
              <v-text-field v-model="shippingInfo.address" label="Address" outlined></v-text-field>
              <v-btn color="primary" @click="step++">Continue</v-btn>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>
        <v-stepper-window-item :value="2">
          <v-card flat>
            <v-card-text>
              <h3 class="mb-4">Order Total: ${{ cartStore.total.toFixed(2) }}</h3>
              <v-btn color="success" @click="placeOrder">Place Order</v-btn>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'

export default {
  name: 'CheckoutView',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const toast = useToast()
    const step = ref(1)
    const shippingInfo = ref({ name: '', address: '' })
    
    const placeOrder = () => {
      toast.success('Order placed successfully!')
      cartStore.clearCart()
      router.push('/orders')
    }
    
    return { step, shippingInfo, cartStore, placeOrder }
  }
}
</script>
