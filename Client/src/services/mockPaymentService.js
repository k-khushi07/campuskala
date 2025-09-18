// Mock Payment Service - No external registration required
// Perfect for testing and development

class MockPaymentService {
  constructor() {
    this.paymentMethods = [
      {
        id: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        icon: '💰',
        color: 'green'
      },
      {
        id: 'mock_card',
        name: 'Card Payment (Demo)',
        description: 'Credit/Debit Card - Demo Mode',
        icon: '💳',
        color: 'blue'
      },
      {
        id: 'mock_upi',
        name: 'UPI Payment (Demo)',
        description: 'Google Pay, PhonePe, Paytm - Demo Mode',
        icon: '📱',
        color: 'purple'
      }
    ]
  }

  // Simulate payment processing delay
  async simulateDelay(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock payment processing
  async processPayment(paymentMethod, amount, userInfo, orderItems) {
    try {
      console.log('🔄 Processing mock payment...', {
        paymentMethod,
        amount,
        userInfo: { name: userInfo.name, email: userInfo.email },
        itemCount: orderItems.length
      })

      // Simulate processing delay
      await this.simulateDelay(1500)

      if (paymentMethod === 'cash_on_delivery') {
        // COD - always succeeds
        return {
          success: true,
          paymentMethod: 'cash_on_delivery',
          amount: amount,
          orderId: `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'COD order placed successfully!'
        }
      } else {
        // Mock online payment - simulate success/failure
        const successRate = 0.95 // 95% success rate for demo
        
        if (Math.random() < successRate) {
          // Successful payment
          return {
            success: true,
            paymentMethod: paymentMethod,
            amount: amount,
            orderId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: 'Payment successful! (Demo Mode)'
          }
        } else {
          // Failed payment (5% chance)
          return {
            success: false,
            paymentMethod: paymentMethod,
            amount: amount,
            orderId: `mock_failed_${Date.now()}`,
            message: 'Payment failed. Please try again. (Demo Mode)'
          }
        }
      }
    } catch (error) {
      console.error('Mock payment error:', error)
      return {
        success: false,
        paymentMethod: paymentMethod,
        amount: amount,
        message: 'Payment processing error. Please try again.'
      }
    }
  }

  // Mock payment modal
  async showPaymentModal(paymentMethod, amount, userInfo) {
    return new Promise((resolve) => {
      // Create mock payment modal
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
          <div class="text-center">
            <div class="w-16 h-16 bg-${this.getPaymentColor(paymentMethod)}-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">${this.getPaymentIcon(paymentMethod)}</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">${this.getPaymentName(paymentMethod)}</h3>
            <p class="text-gray-600 mb-4">Amount: ${this.formatCurrency(amount)}</p>
            <p class="text-sm text-gray-500 mb-6">Demo Mode - No real payment required</p>
            
            <div class="space-y-3">
              <button id="pay-success" class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                ✅ Simulate Success
              </button>
              <button id="pay-cancel" class="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                ❌ Cancel Payment
              </button>
            </div>
          </div>
        </div>
      `

      // Add event listeners
      modal.querySelector('#pay-success').onclick = () => {
        document.body.removeChild(modal)
        resolve({
          success: true,
          paymentMethod: paymentMethod,
          amount: amount,
          orderId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'Payment successful! (Demo Mode)'
        })
      }

      modal.querySelector('#pay-cancel').onclick = () => {
        document.body.removeChild(modal)
        resolve({
          success: false,
          paymentMethod: paymentMethod,
          amount: amount,
          message: 'Payment cancelled by user'
        })
      }

      // Add to DOM
      document.body.appendChild(modal)
    })
  }

  // Get payment method details
  getPaymentMethod(methodId) {
    return this.paymentMethods.find(method => method.id === methodId)
  }

  getPaymentName(methodId) {
    const method = this.getPaymentMethod(methodId)
    return method ? method.name : 'Unknown Payment Method'
  }

  getPaymentIcon(methodId) {
    const method = this.getPaymentMethod(methodId)
    return method ? method.icon : '💳'
  }

  getPaymentColor(methodId) {
    const method = this.getPaymentMethod(methodId)
    return method ? method.color : 'blue'
  }

  // Format currency
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Get all payment methods
  getAllPaymentMethods() {
    return this.paymentMethods
  }

  // Validate payment data
  validatePayment(userInfo, shippingAddress) {
    const errors = []

    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      errors.push('Please provide complete contact information')
    }

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      errors.push('Please provide complete shipping address')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Mock analytics
  logPaymentEvent(eventType, data) {
    console.log(`📊 Payment Event: ${eventType}`, data)
    // In a real app, you would send this to analytics service
  }
}

export const mockPaymentService = new MockPaymentService()
export default mockPaymentService
