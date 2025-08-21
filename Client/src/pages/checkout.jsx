// src/pages/Checkout.jsx
import React from 'react'

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Checkout
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Complete your purchase here.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-500">
              Coming soon - Secure checkout with payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout