<<<<<<< Updated upstream
<<<<<<< Updated upstream
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import OrderManagement from '../components/OrderManagement'
import { Package, ShoppingBag } from 'lucide-react'

const Orders = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('buyer') // 'buyer' or 'seller'
=======
=======
>>>>>>> Stashed changes
import React from 'react'
import { useAuth } from '../context/AuthContext'
import OrderManagement from '../components/OrderManagement'

const Orders = () => {
  const { currentUser } = useAuth()
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        {/* Header with Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Orders</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'buyer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={18} className="mr-2" />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'seller'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={18} className="mr-2" />
              Manage Orders
            </button>
          </div>
        </div>

        {/* Content */}
        <OrderManagement userType={activeTab} />
=======
        <OrderManagement />
>>>>>>> Stashed changes
=======
        <OrderManagement />
>>>>>>> Stashed changes
      </div>
    </div>
  )
}

export default Orders
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
