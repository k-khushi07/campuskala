// Razorpay service for payment processing
class RazorpayService {
  constructor() {
    this.razorpayLoaded = false
    this.loadRazorpay()
  }

  async loadRazorpay() {
    if (this.razorpayLoaded) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        this.razorpayLoaded = true
        resolve()
      }
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay'))
      }
      document.body.appendChild(script)
    })
  }

  // Create Razorpay order (this would typically be done on your backend)
  async createOrder(amount, currency = 'INR', receipt = 'order_receipt') {
    try {
      // For demo purposes, we'll create a mock order
      // In production, this should be done on your backend
      const orderData = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
        notes: {
          source: 'CampusKala'
        }
      }

      // Mock order ID - in production, call your backend API
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        id: mockOrderId,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw error
    }
  }

  // Open Razorpay checkout
  async openCheckout(orderData, userInfo, options = {}) {
    try {
      await this.loadRazorpay()

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Your Razorpay key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CampusKala',
        description: 'Order Payment',
        order_id: orderData.id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone
        },
        notes: {
          order_receipt: orderData.receipt
        },
        theme: {
          color: '#7C3AED' // Purple theme to match your app
        },
        handler: options.onSuccess || (() => {}),
        modal: {
          ondismiss: options.onDismiss || (() => {})
        },
        ...options
      }

      const razorpay = new window.Razorpay(razorpayOptions)
      razorpay.open()

      return razorpay
    } catch (error) {
      console.error('Error opening Razorpay checkout:', error)
      throw error
    }
  }

  // Process payment for different payment methods
  async processPayment(paymentMethod, amount, userInfo, orderItems) {
    try {
      if (paymentMethod === 'cash_on_delivery') {
        // For COD, no payment processing needed
        return {
          success: true,
          paymentMethod: 'cash_on_delivery',
          amount: amount,
          orderId: `cod_${Date.now()}`,
          message: 'Cash on Delivery order placed successfully'
        }
      }

      // Create order for online payments
      const orderData = await this.createOrder(
        amount,
        'INR',
        `order_${Date.now()}`
      )

      return new Promise((resolve, reject) => {
        const options = {
          onSuccess: (response) => {
            resolve({
              success: true,
              paymentMethod: paymentMethod,
              amount: amount,
              orderId: orderData.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              message: 'Payment successful'
            })
          },
          onDismiss: () => {
            resolve({
              success: false,
              paymentMethod: paymentMethod,
              amount: amount,
              orderId: orderData.id,
              message: 'Payment cancelled by user'
            })
          }
        }

        this.openCheckout(orderData, userInfo, options)
          .catch(reject)
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  // Verify payment signature (this should be done on your backend)
  verifyPaymentSignature(paymentData) {
    // In production, this verification should be done on your backend
    // using the Razorpay webhook secret
    console.log('Payment verification (mock):', paymentData)
    return true // Mock verification
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

export const razorpayService = new RazorpayService()
export default razorpayService
