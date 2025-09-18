import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Eye, 
  XCircle,
  Calendar,
  User,
  Navigation,
  Phone,
  Mail
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRealtimeOrders } from '../hooks/useRealtime'
import OrderTrackingMap from '../components/OrderTrackingMap'

const MyOrders = () => {
  const { currentUser } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // Get orders for current user (buyer)
  const { orders, loading } = useRealtimeOrders(currentUser?.uid, 'buyer')

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'approved': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'shipped': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'delivered': return 'text-green-600 bg-green-100 border-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval': return <Clock className="w-4 h-4" />
      case 'approved': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval'
      case 'approved': return 'Approved'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true
    return order.status === filterStatus
  })

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateTotal = (items) => {
    if (!items) return 0
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and delivery status</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending_approval', label: 'Pending', count: orders.filter(o => o.status === 'pending_approval').length },
              { key: 'approved', label: 'Approved', count: orders.filter(o => o.status === 'approved').length },
              { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet." 
                : `No orders with status "${getStatusText(filterStatus)}"`}
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        From: <span className="font-medium">{order.sellerName}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Ordered on: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{order.totalAmount || calculateTotal(order.items)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <img
                            src={item.image || item.images?.[0] || 'https://via.placeholder.com/60x60'}
                            alt={item.title || item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{item.title || item.name}</p>
                            <p className="text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">Delivery Address:</p>
                          <p className="text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowModal(true)
                          setShowMap(false)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      {(order.status === 'approved' || order.status === 'shipped') && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                            setShowMap(true)
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Track Order</span>
                        </button>
                      )}
                    </div>

                    {/* Status Progress */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${order.status === 'pending_approval' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${order.status === 'approved' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${order.status === 'shipped' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details #{selectedOrder.id.slice(-8)}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Order Status */}
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2">{getStatusText(selectedOrder.status)}</span>
                  </div>
                </div>

                {/* Order Progress */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
                  <div className="flex items-center justify-between">
                    {[
                      { status: 'pending_approval', label: 'Order Placed', icon: Clock },
                      { status: 'approved', label: 'Approved', icon: Package },
                      { status: 'shipped', label: 'Shipped', icon: Truck },
                      { status: 'delivered', label: 'Delivered', icon: CheckCircle }
                    ].map((step, index) => {
                      const isActive = selectedOrder.status === step.status
                      const isCompleted = ['pending_approval', 'approved', 'shipped', 'delivered'].indexOf(selectedOrder.status) > ['pending_approval', 'approved', 'shipped', 'delivered'].indexOf(step.status)
                      const Icon = step.icon
                      
                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isCompleted ? 'bg-green-500 border-green-500 text-white' :
                            isActive ? 'bg-blue-500 border-blue-500 text-white' :
                            'bg-gray-200 border-gray-300 text-gray-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs mt-2 text-center ${
                            isCompleted || isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Seller Information */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.sellerName}</p>
                        <p className="text-sm text-gray-600">Seller</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Contact via platform</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/60x60'}
                          alt={item.title || item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title || item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ₹{item.price} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{selectedOrder.itemTitle}</p>
                        <p className="text-sm text-gray-600">Quantity: {selectedOrder.quantity || 1}</p>
                        <p className="font-medium mt-1">₹{selectedOrder.totalAmount}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Ordered on: {formatDate(selectedOrder.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Tracking */}
                {(selectedOrder.status === 'approved' || selectedOrder.status === 'shipped') && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Order Tracking</h3>
                      <button
                        onClick={() => setShowMap(!showMap)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                      </button>
                    </div>
                    
                    {showMap && (
                      <OrderTrackingMap order={selectedOrder} isVisible={showMap} />
                    )}
                    
                    {!showMap && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <Navigation className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click "Show Map" to track your order delivery</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Amount:</span>
                    <span className="font-bold text-xl text-purple-600">
                      ₹{selectedOrder.totalAmount || calculateTotal(selectedOrder.items)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders
