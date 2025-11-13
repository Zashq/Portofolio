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
  async getStripeInstance() {
    return await getStripe()
  }


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

}

export default new StripeService()
