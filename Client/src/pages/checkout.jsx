import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { paymentService } from '../services/payment'
import { stripeService } from '../services/stripe'
import orderService from '../services/orderService'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { currentUser, userProfile } = useAuth()
  const { items: cartItems, clearCart } = useCart()

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePayment = async () => {
    if (!currentUser) {
      setError('Please log in to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone) {
        throw new Error('Please fill in all required fields')
      }
      const orderData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || shippingAddress.name,
        userEmail: currentUser.email || shippingAddress.email,
        items: cartItems,
        totalAmount: calculateTotal(),
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending'
      }

      // Create orders for each seller using our order service
      const buyerInfo = {
        id: currentUser.uid,
        name: userProfile?.displayName || shippingAddress.name,
        email: shippingAddress.email,
        address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        instructions: shippingAddress.instructions || ''
      }

      const orders = await orderService.createOrderFromCart(cartItems, buyerInfo)
      
      // Clear cart after successful order creation
      clearCart()
      
      // Show success message
      setSuccess(true)
      console.log('Orders created successfully:', orders)
      
      // For demo purposes, show success
      alert(`Orders created successfully! ${orders.length} order(s) sent to sellers for approval.`)

    } catch (error) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {/* Shipping Address Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">
                      {paymentService.formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <hr className="my-4" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{paymentService.formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            {/* Payment Component */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              <p className="text-gray-600 mb-6">
                Secure payment powered by Stripe
              </p>
              
              <button
                onClick={handlePayment}
                disabled={loading || !currentUser}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : `Pay ${paymentService.formatCurrency(calculateTotal())}`}
              </button>
              
              {!currentUser && (
                <p className="text-sm text-red-600 mt-2">
                  Please log in to continue with payment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
