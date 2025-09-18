// Multi-seller payment service for handling payments across multiple sellers/creators
import { mockPaymentService } from './mockPaymentService'
import orderService from './orderService'

class MultiSellerPaymentService {
  constructor() {
    this.pendingTransactions = new Map() // Store pending payment transactions
  }

  // Group cart items by seller
  groupItemsBySeller(cartItems) {
    return cartItems.reduce((acc, item) => {
      const sellerId = item.creator?.id || item.sellerId
      const sellerName = item.creator?.name || item.sellerName
      
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0
        }
      }
      
      acc[sellerId].items.push(item)
      acc[sellerId].subtotal += item.price * item.quantity
      
      return acc
    }, {})
  }

  // Calculate shipping and tax for each seller
  calculateSellerTotals(sellerGroups, shippingAddress) {
    const results = {}
    
    Object.entries(sellerGroups).forEach(([sellerId, sellerData]) => {
      const subtotal = sellerData.subtotal
      const shippingCost = this.calculateShipping(subtotal, shippingAddress)
      const tax = Math.round(subtotal * 0.18) // 18% GST
      const total = subtotal + shippingCost + tax
      
      results[sellerId] = {
        ...sellerData,
        subtotal,
        shippingCost,
        tax,
        total
      }
    })
    
    return results
  }

  // Calculate shipping cost (free over ₹1000 per seller)
  calculateShipping(subtotal, shippingAddress) {
    // Free shipping for orders over ₹1000 from same seller
    return subtotal > 1000 ? 0 : 100
  }

  // Create payment summary for user
  createPaymentSummary(sellerTotals) {
    const totalSubtotal = Object.values(sellerTotals).reduce((sum, seller) => sum + seller.subtotal, 0)
    const totalShipping = Object.values(sellerTotals).reduce((sum, seller) => sum + seller.shippingCost, 0)
    const totalTax = Object.values(sellerTotals).reduce((sum, seller) => sum + seller.tax, 0)
    const grandTotal = totalSubtotal + totalShipping + totalTax

    return {
      sellerBreakdown: sellerTotals,
      summary: {
        totalSubtotal,
        totalShipping,
        totalTax,
        grandTotal,
        sellerCount: Object.keys(sellerTotals).length
      }
    }
  }

  // Process payment for multiple sellers
  async processMultiSellerPayment(paymentMethod, cartItems, userInfo, shippingAddress) {
    try {
      // Group items by seller
      const sellerGroups = this.groupItemsBySeller(cartItems)
      const sellerTotals = this.calculateSellerTotals(sellerGroups, shippingAddress)
      const paymentSummary = this.createPaymentSummary(sellerTotals)

      console.log('Payment Summary:', paymentSummary)

      if (paymentMethod === 'cash_on_delivery') {
        return await this.processCODPayment(sellerTotals, userInfo, shippingAddress, paymentSummary)
      } else {
        return await this.processOnlinePayment(paymentMethod, paymentSummary, userInfo, shippingAddress)
      }
    } catch (error) {
      console.error('Error processing multi-seller payment:', error)
      throw error
    }
  }

  // Process Cash on Delivery payment
  async processCODPayment(sellerTotals, userInfo, shippingAddress, paymentSummary) {
    try {
      const orders = []
      const transactionId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create orders for each seller
      for (const [sellerId, sellerData] of Object.entries(sellerTotals)) {
        const buyerInfo = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
          instructions: shippingAddress.instructions || '',
          paymentMethod: 'cash_on_delivery',
          transactionId: transactionId
        }

        const order = await orderService.createOrderFromCart(sellerData.items, buyerInfo)
        orders.push(...order)
      }

      return {
        success: true,
        paymentMethod: 'cash_on_delivery',
        transactionId,
        orders,
        totalAmount: paymentSummary.summary.grandTotal,
        sellerCount: paymentSummary.summary.sellerCount,
        message: `COD order placed successfully! ${orders.length} order(s) sent to ${paymentSummary.summary.sellerCount} seller(s) for approval.`
      }
    } catch (error) {
      console.error('Error processing COD payment:', error)
      throw error
    }
  }

  // Process online payment (Razorpay)
  async processOnlinePayment(paymentMethod, paymentSummary, userInfo, shippingAddress) {
    try {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store transaction details for later processing
      this.pendingTransactions.set(transactionId, {
        paymentSummary,
        userInfo,
        shippingAddress,
        paymentMethod,
        timestamp: Date.now()
      })

      // Process payment through mock payment service
      const paymentResult = await mockPaymentService.processPayment(
        paymentMethod,
        paymentSummary.summary.grandTotal,
        userInfo,
        paymentSummary.sellerBreakdown
      )

      if (paymentResult.success) {
        // Create orders after successful payment
        const orders = await this.createOrdersAfterPayment(
          transactionId,
          paymentResult,
          userInfo,
          shippingAddress
        )

        // Clean up pending transaction
        this.pendingTransactions.delete(transactionId)

        return {
          success: true,
          paymentMethod: paymentMethod,
          transactionId,
          razorpayPaymentId: paymentResult.razorpayPaymentId,
          razorpayOrderId: paymentResult.razorpayOrderId,
          orders,
          totalAmount: paymentSummary.summary.grandTotal,
          sellerCount: paymentSummary.summary.sellerCount,
          message: `Payment successful! Order placed successfully. ${orders.length} order(s) sent to ${paymentSummary.summary.sellerCount} seller(s) for approval.`
        }
      } else {
        // Clean up pending transaction on failure
        this.pendingTransactions.delete(transactionId)
        
        return {
          success: false,
          paymentMethod: paymentMethod,
          transactionId,
          message: paymentResult.message || 'Payment failed. Please try again.'
        }
      }
    } catch (error) {
      console.error('Error processing online payment:', error)
      throw error
    }
  }

  // Create orders after successful payment
  async createOrdersAfterPayment(transactionId, paymentResult, userInfo, shippingAddress) {
    try {
      const transaction = this.pendingTransactions.get(transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      const { paymentSummary } = transaction
      const orders = []

      // Create orders for each seller
      for (const [sellerId, sellerData] of Object.entries(paymentSummary.sellerBreakdown)) {
        const buyerInfo = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
          instructions: shippingAddress.instructions || '',
          paymentMethod: transaction.paymentMethod,
          paymentId: paymentResult.razorpayPaymentId,
          orderId: paymentResult.razorpayOrderId,
          transactionId: transactionId,
          sellerAmount: sellerData.total
        }

        const order = await orderService.createOrderFromCart(sellerData.items, buyerInfo)
        orders.push(...order)
      }

      return orders
    } catch (error) {
      console.error('Error creating orders after payment:', error)
      throw error
    }
  }

  // Handle payment failures and cleanup
  async handlePaymentFailure(transactionId, reason) {
    try {
      const transaction = this.pendingTransactions.get(transactionId)
      if (transaction) {
        // Log failure for analytics
        console.log('Payment failure:', { transactionId, reason, transaction })
        
        // Clean up pending transaction
        this.pendingTransactions.delete(transactionId)
        
        // You could also send notifications or update analytics here
        return { success: true, message: 'Payment failure handled' }
      }
      
      return { success: false, message: 'Transaction not found' }
    } catch (error) {
      console.error('Error handling payment failure:', error)
      throw error
    }
  }

  // Get payment breakdown for display
  getPaymentBreakdown(sellerTotals) {
    return Object.entries(sellerTotals).map(([sellerId, sellerData]) => ({
      sellerId,
      sellerName: sellerData.sellerName,
      itemCount: sellerData.items.length,
      subtotal: sellerData.subtotal,
      shipping: sellerData.shippingCost,
      tax: sellerData.tax,
      total: sellerData.total,
      items: sellerData.items.map(item => ({
        name: item.name || item.title,
        quantity: item.quantity,
        price: item.price
      }))
    }))
  }

  // Validate payment before processing
  validatePayment(cartItems, userInfo, shippingAddress) {
    const errors = []

    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      errors.push('Cart is empty')
    }

    // Check required user info
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      errors.push('Please provide complete contact information')
    }

    // Check required shipping info
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      errors.push('Please provide complete shipping address')
    }

    // Check if all items have seller info
    const itemsWithoutSeller = cartItems.filter(item => !item.creator?.id && !item.sellerId)
    if (itemsWithoutSeller.length > 0) {
      errors.push('Some items are missing seller information')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get pending transactions (for admin/debugging)
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.entries()).map(([id, transaction]) => ({
      id,
      timestamp: transaction.timestamp,
      sellerCount: Object.keys(transaction.paymentSummary.sellerBreakdown).length,
      totalAmount: transaction.paymentSummary.summary.grandTotal
    }))
  }
}

export const multiSellerPaymentService = new MultiSellerPaymentService()
export default multiSellerPaymentService
