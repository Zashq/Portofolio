import { loadStripe } from '@stripe/stripe-js'
import { functions } from '@/main'
import { httpsCallable } from 'firebase/functions'

let stripePromise = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

class StripeService {
  /**
   * Get Stripe instance
   */
  async getStripeInstance() {
    return await getStripe()
  }

  /**
   * Create payment intent for checkout
   * @param {number} amount - Amount in dollars (e.g., 99.99)
   * @param {object} metadata - Additional data
   */
  async createPaymentIntent(amount, metadata = {}) {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')
      
      const response = await createPaymentIntent({
        amount: amount,
        currency: 'usd',
        metadata
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  /**
   * Process checkout payment
   * @param {string} clientSecret - Payment intent client secret
   * @param {object} cardElement - Stripe card element
   */
  async confirmPayment(clientSecret, paymentMethod) {
    try {
      const stripe = await getStripe()
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return result.paymentIntent
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw error
    }
  }

  /**
   * Create subscription for price alerts
   * @param {string} priceId - Stripe price ID
   */
  async createSubscription(priceId) {
    try {
      const createSubscription = httpsCallable(functions, 'createSubscription')
      
      const response = await createSubscription({
        priceId
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Stripe subscription ID
   */
  async cancelSubscription(subscriptionId) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription')
      
      const response = await cancelSubscription({
        subscriptionId
      })
      
      return response.data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Get customer subscriptions
   */
  async getSubscriptions() {
    try {
      const getSubscriptions = httpsCallable(functions, 'getSubscriptions')
      const response = await getSubscriptions()
      return response.data
    } catch (error) {
      console.error('Error getting subscriptions:', error)
      throw error
    }
  }
}

export default new StripeService()
