import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  MessageCircle,
  Eye,
  AlertCircle,
  Navigation
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRealtimeOrders } from '../hooks/useRealtime'
import orderService from '../services/orderService'
import notificationService from '../services/notificationService'
import OrderTrackingMap from './OrderTrackingMap'

const OrderManagement = () => {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Get orders for current user (seller)
  const { orders: sellerOrders, loading: ordersLoading } = useRealtimeOrders(currentUser?.uid, 'seller')

  useEffect(() => {
    if (sellerOrders) {
      setOrders(sellerOrders)
      setLoading(false)
    }
  }, [sellerOrders])

  const handleApproveOrder = async (orderId) => {
    try {
      await orderService.approveOrder(orderId, currentUser.uid)
      setShowModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error approving order:', error)
    }
  }

  const handleRejectOrder = async () => {
    try {
      await orderService.rejectOrder(selectedOrder.id, currentUser.uid, rejectionReason)
      setShowRejectionModal(false)
      setShowModal(false)
      setSelectedOrder(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting order:', error)
    }
  }

  const handleShipOrder = async (orderId) => {
    try {
      await orderService.shipOrder(orderId, currentUser.uid, {
        trackingNumber: `TRK${Date.now()}`,
        carrier: 'CampusKala Delivery',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
      setShowModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error shipping order:', error)
    }
  }

  const handleDeliverOrder = async (orderId) => {
    try {
      await orderService.deliverOrder(orderId, currentUser.uid)
      setShowModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error delivering order:', error)
    }
  }

  const handleCompleteOrder = async (orderId) => {
    try {
      await orderService.completeOrder(orderId, currentUser.uid)
      setShowModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval':
        return <Clock size={16} />
      case 'approved':
        return <CheckCircle size={16} />
      case 'rejected':
        return <XCircle size={16} />
      case 'completed':
        return <Package size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage your product orders and service bookings</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here when customers purchase your products or book your services.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.type === 'product' ? 'Product Order' : 'Service Booking'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{order.buyerName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                {order.deliveryAddress && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 md:col-span-2">
                    <MapPin size={16} />
                    <span>{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  )) || (
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{order.itemTitle}</p>
                      <p className="text-sm text-gray-600">Qty: {order.quantity || 1}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">₹{order.totalAmount || calculateTotal(order.items || [])}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedOrder(order)
                    setShowModal(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>

                <div className="flex space-x-2">
                  {order.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApproveOrder(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowRejectionModal(true)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {order.status === 'approved' && (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2">{selectedOrder.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedOrder.buyerName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.buyerEmail}</p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    )) || (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{selectedOrder.itemTitle}</p>
                        <p className="text-sm text-gray-600">Quantity: {selectedOrder.quantity || 1}</p>
                        <p className="font-medium mt-1">₹{selectedOrder.totalAmount}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Amount:</span>
                      <span className="font-bold text-xl">₹{selectedOrder.totalAmount || calculateTotal(selectedOrder.items || [])}</span>
                    </div>
                  </div>
                </div>

                {/* Map Tracking */}
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
                      <p className="text-sm text-gray-600">Click "Show Map" to view delivery tracking</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedOrder.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApproveOrder(selectedOrder.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Order
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setShowRejectionModal(true)
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Order
                      </button>
                    </>
                  )}
                  
                  {selectedOrder.status === 'approved' && (
                    <button
                      onClick={() => handleShipOrder(selectedOrder.id)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => handleDeliverOrder(selectedOrder.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectionModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Order</h3>
                <p className="text-gray-600 mb-4">Please provide a reason for rejecting this order:</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                />
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectOrder}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement