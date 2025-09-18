import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { paymentService } from '../services/payment'
import orderService from '../services/orderService'
import { mockPaymentService } from '../services/mockPaymentService'
import multiSellerPaymentService from '../services/multiSellerPaymentService'
import OrderSummary from '../components/OrderSummary'
import MultiSellerOrderSummary from '../components/MultiSellerOrderSummary'
import PaymentOptionsSimple from '../components/PaymentOptionsSimple'
import { ArrowLeft, CheckCircle, AlertCircle, MapPin, CreditCard } from 'lucide-react'

const CheckoutPage = () => {
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const { currentUser, userProfile } = useAuth()
  const { items: cartItems, clearCart } = useCart()

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    const shippingCost = subtotal > 1000 ? 0 : 100 // Free shipping over ₹1000
    const tax = Math.round(subtotal * 0.18) // 18% GST
    return subtotal + shippingCost + tax
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method)
  }

  const handlePlaceOrder = async (paymentMethod, amount) => {
    if (!currentUser) {
      setError('Please log in to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Prepare user info for payment
      const userInfo = {
        id: currentUser.uid,
        name: userProfile?.displayName || shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone
      }

      // Validate payment data
      const validation = multiSellerPaymentService.validatePayment(cartItems, userInfo, shippingAddress)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      if (!paymentMethod) {
        throw new Error('Please select a payment method')
      }

      // Process multi-seller payment
      const result = await multiSellerPaymentService.processMultiSellerPayment(
        paymentMethod,
        cartItems,
        userInfo,
        shippingAddress
      )

      if (result.success) {
        // Clear cart after successful order creation
        clearCart()
        
        // Show success message
        setOrderPlaced(true)
        setSuccess(true)
        
        // Redirect to my orders after a short delay
        setTimeout(() => {
          window.location.href = '/my-orders'
        }, 2000)
        
        alert(result.message)
      } else {
        setError(result.message || 'Payment failed. Please try again.')
      }

    } catch (error) {
      console.error('Order creation error:', error)
      setError(error.message || 'Order creation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      window.location.href = '/cart'
    }
  }, [cartItems.length, orderPlaced])

  // Pre-fill form with user data
  useEffect(() => {
    if (currentUser && userProfile) {
      setShippingAddress(prev => ({
        ...prev,
        name: userProfile.displayName || prev.name,
        email: currentUser.email || prev.email,
        phone: userProfile.phone || prev.phone
      }))
    }
  }, [currentUser, userProfile])

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                  <p className="text-gray-600 mb-6">
                    Your order has been placed and payment has been processed. You will receive a confirmation email shortly.
                    <br />
                    <span className="text-sm text-blue-600 mt-2 block">
                      Redirecting to order management in 2 seconds...
                    </span>
                  </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/my-orders'}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your purchase with confidence</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Payment Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Address Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <MapPin className="mr-3 text-purple-600" size={24} />
                Shipping Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your state"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    placeholder="Enter your complete address with house number, street, area, etc."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <CreditCard className="mr-3 text-purple-600" size={24} />
                Payment Method
              </h2>
              
              <PaymentOptionsSimple
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
                loading={loading}
              />
            </div>
          </div>
          
                 {/* Right Column - Multi-Seller Order Summary */}
                 <div>
                   <MultiSellerOrderSummary
                     items={cartItems}
                     shippingAddress={shippingAddress}
                     onPaymentMethodSelect={handlePaymentMethodSelect}
                     selectedPaymentMethod={selectedPaymentMethod}
                     onPlaceOrder={handlePlaceOrder}
                     loading={loading}
                     error={error}
                   />
                 </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
