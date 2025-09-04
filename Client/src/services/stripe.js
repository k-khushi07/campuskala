/*import { loadStripe } from '@stripe/stripe-js'
import { httpsCallable } from 'firebase/functions'
import { doc, onSnapshot } from 'firebase/firestore'
import { functions, db } from './firebase'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

class StripeService {
  constructor() {
    this.stripe = null
    this.init()
  }

  async init() {
    this.stripe = await stripePromise
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')
      const result = await createPaymentIntent({
        amount: amount * 100, // Convert to cents
        currency,
        metadata
      })
      
      return result.data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  // Create checkout session for products/services
  async createCheckoutSession(items, successUrl, cancelUrl, metadata = {}) {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession')
      const result = await createCheckoutSession({
        line_items: items.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
              description: item.description,
              images: item.images || []
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity || 1
        })),
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      })
      
      return result.data
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId) {
    if (!this.stripe) {
      await this.init()
    }
    
    const { error } = await this.stripe.redirectToCheckout({
      sessionId
    })
    
    if (error) {
      console.error('Stripe redirect error:', error)
      throw error
    }
  }

  // Create subscription for premium features
  async createSubscription(priceId, successUrl, cancelUrl) {
    try {
      const createSubscription = httpsCallable(functions, 'createSubscription')
      const result = await createSubscription({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl
      })
      
      return result.data
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription')
      const result = await cancelSubscription({ subscription_id: subscriptionId })
      
      return result.data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Get customer's payment methods
  async getPaymentMethods(customerId) {
    try {
      const getPaymentMethods = httpsCallable(functions, 'getPaymentMethods')
      const result = await getPaymentMethods({ customer_id: customerId })
      
      return result.data
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId) {
    try {
      const createSetupIntent = httpsCallable(functions, 'createSetupIntent')
      const result = await createSetupIntent({ customer_id: customerId })
      
      return result.data
    } catch (error) {
      console.error('Error creating setup intent:', error)
      throw error
    }
  }

  // Process refund
  async processRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
    try {
      const processRefund = httpsCallable(functions, 'processRefund')
      const result = await processRefund({
        payment_intent_id: paymentIntentId,
        amount: amount ? amount * 100 : undefined, // Convert to cents if specified
        reason
      })
      
      return result.data
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  // Listen to payment status changes
  listenToPaymentStatus(userId, callback) {
    return onSnapshot(
      doc(db, 'customers', userId),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data())
        }
      },
      (error) => {
        console.error('Error listening to payment status:', error)
      }
    )
  }

  // Format currency for display
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }
}

export const stripeService = new StripeService()
export default stripeService*/
