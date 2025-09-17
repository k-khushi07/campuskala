// Import services dynamically to avoid circular dependencies
import orderService from './orderService'
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc 
} from 'firebase/firestore'
import { db } from './firebase'

class PaymentService {
  constructor() {
    this.orderService = orderService
    this.stripeService = null // Will be loaded dynamically
  }

  // Dynamically import stripe service to avoid circular dependencies
  async getStripeService() {
    if (!this.stripeService) {
      const { stripeService } = await import('./stripe')
      this.stripeService = stripeService
    }
    return this.stripeService
  }

  // Create order and initiate payment
  async createOrderAndPay(orderData, paymentMethod = 'stripe') {
    try {
      // Create order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      const orderId = orderRef.id

      if (paymentMethod === 'stripe') {
        // Create Stripe payment intent
        const stripeService = await this.getStripeService()
        const paymentIntent = await stripeService.createPaymentIntent(
          orderData.totalAmount,
          'inr',
          { orderId, userId: orderData.userId }
        )

        // Update order with payment intent ID
        await updateDoc(doc(db, 'orders', orderId), {
          stripePaymentIntentId: paymentIntent.id,
          updatedAt: serverTimestamp()
        })

        return {
          orderId,
          paymentIntent,
          clientSecret: paymentIntent.client_secret
        }
      }

      return { orderId }
    } catch (error) {
      console.error('Error creating order and payment:', error)
      throw error
    }
  }

  // Process payment for existing order
  async processPayment(orderId, paymentData) {
    try {
      const order = await this.orderService.getOrder(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.paymentStatus === 'paid') {
        throw new Error('Order already paid')
      }

      // Update payment status
      await this.orderService.updatePaymentStatus(orderId, 'paid', {
        stripePaymentIntentId: paymentData.paymentIntentId,
        paidAt: serverTimestamp()
      })

      // Create payment record
      await addDoc(collection(db, 'payments'), {
        orderId,
        userId: order.userId,
        amount: order.totalAmount,
        currency: 'inr',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentData.paymentIntentId,
        status: 'succeeded',
        createdAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  // Create checkout session for multiple items
  async createCheckoutSession(items, successUrl, cancelUrl, metadata = {}) {
    try {
      const stripeService = await this.getStripeService()
      const session = await stripeService.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
        metadata
      )

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentIntentId) {
    try {
      // Find order by payment intent ID
      const ordersQuery = await db.collection('orders')
        .where('stripePaymentIntentId', '==', paymentIntentId)
        .limit(1)
        .get()

      if (ordersQuery.empty) {
        throw new Error('Order not found for payment intent')
      }

      const orderDoc = ordersQuery.docs[0]
      const orderId = orderDoc.id

      // Update order status
      await this.orderService.updatePaymentStatus(orderId, 'paid', {
        stripePaymentIntentId: paymentIntentId,
        paidAt: serverTimestamp()
      })

      // Create payment record
      const orderData = orderDoc.data()
      await addDoc(collection(db, 'payments'), {
        orderId,
        userId: orderData.userId,
        amount: orderData.totalAmount,
        currency: 'inr',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId,
        status: 'succeeded',
        createdAt: serverTimestamp()
      })

      return { orderId, success: true }
    } catch (error) {
      console.error('Error handling payment success:', error)
      throw error
    }
  }

  // Handle failed payment
  async handlePaymentFailure(paymentIntentId, errorMessage) {
    try {
      // Find order by payment intent ID
      const ordersQuery = await db.collection('orders')
        .where('stripePaymentIntentId', '==', paymentIntentId)
        .limit(1)
        .get()

      if (ordersQuery.empty) {
        throw new Error('Order not found for payment intent')
      }

      const orderDoc = ordersQuery.docs[0]
      const orderId = orderDoc.id

      // Update order payment status
      await this.orderService.updatePaymentStatus(orderId, 'failed', {
        paymentError: errorMessage,
        paymentFailedAt: serverTimestamp()
      })

      return { orderId, success: true }
    } catch (error) {
      console.error('Error handling payment failure:', error)
      throw error
    }
  }

  // Process refund
  async processRefund(orderId, amount, reason = 'requested_by_customer') {
    try {
      const order = await this.orderService.getOrder(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }

      if (!order.stripePaymentIntentId) {
        throw new Error('No payment intent found for this order')
      }

      const stripeService = await this.getStripeService()
      const refund = await stripeService.processRefund(
        order.stripePaymentIntentId,
        amount || order.totalAmount,
        reason
      )

      // Create refund record
      await addDoc(collection(db, 'refunds'), {
        orderId,
        userId: order.userId,
        amount: refund.amount,
        reason,
        status: refund.status,
        stripeRefundId: refund.id,
        createdAt: serverTimestamp()
      })

      return refund
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  // Get payment methods for user
  async getPaymentMethods(userId) {
    try {
      // This would require additional backend function
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
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

  // Validate payment data
  validatePaymentData(paymentData) {
    const errors = []

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid amount')
    }

    if (!paymentData.currency) {
      errors.push('Currency is required')
    }

    if (!paymentData.userId) {
      errors.push('User ID is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const paymentService = new PaymentService()
export default paymentService
