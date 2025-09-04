import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const CheckoutPage = () => {
  const [shippingAddress, setShippingAddress] = useState({})
  const { currentUser } = useAuth()
  // ✅ Removed: const { cartItems } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {/* Shipping Address Form (placeholder) */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <p className="text-gray-600">Address form coming soon...</p>
            </div>
            
            {/* Order Summary (placeholder) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <p className="text-gray-600">Cart items will be displayed here...</p>
            </div>
          </div>
          
          <div>
            {/* Payment Component (placeholder) */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Integration Coming Soon
              </h2>
              <p className="text-gray-600">
                We're working on secure payment processing for CampusKala
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
