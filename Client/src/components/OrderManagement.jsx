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
  Truck,
  Navigation
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRealtimeOrders } from '../hooks/useRealtime'
import orderService from '../services/orderService'
import notificationService from '../services/notificationService'
import OrderTracking from './OrderTracking'

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const OrderManagement = ({ userType = 'seller' }) => {
=======
const OrderManagement = () => {
>>>>>>> Stashed changes
=======
const OrderManagement = () => {
>>>>>>> Stashed changes
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // 'details' or 'tracking'

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Get orders for current user (seller or buyer)
  const { orders: userOrders, loading: ordersLoading } = useRealtimeOrders(currentUser?.uid, userType)

  useEffect(() => {
    if (userOrders) {
      setOrders(userOrders)
      setLoading(false)
    }
  }, [userOrders])
=======
=======
>>>>>>> Stashed changes
  // Get orders for current user (seller)
  const { orders: sellerOrders, loading: ordersLoading } = useRealtimeOrders(currentUser?.uid, 'seller')

  useEffect(() => {
    if (sellerOrders) {
      setOrders(sellerOrders)
      setLoading(false)
    }
  }, [sellerOrders])
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {userType === 'seller' ? 'Order Management' : 'My Orders'}
        </h1>
        <p className="text-gray-600">
          {userType === 'seller' 
            ? 'Manage your product orders and service bookings' 
            : 'Track your orders and view order history'
          }
        </p>
=======
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage your product orders and service bookings</p>
>>>>>>> Stashed changes
=======
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage your product orders and service bookings</p>
>>>>>>> Stashed changes
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            <p className="text-gray-600">
              {userType === 'seller' 
                ? 'Orders will appear here when customers purchase your products or book your services.'
                : 'Your orders will appear here once you make a purchase or book a service.'
              }
            </p>
=======
            <p className="text-gray-600">Orders will appear here when customers purchase your products or book your services.</p>
>>>>>>> Stashed changes
=======
            <p className="text-gray-600">Orders will appear here when customers purchase your products or book your services.</p>
>>>>>>> Stashed changes
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
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{order.buyerName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.buyerEmail}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total Amount</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{order.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items/Service */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {order.type === 'product' ? 'Items' : 'Service'}
                </h4>
                {order.type === 'product' ? (
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.title}</h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900">{order.service?.title}</h5>
                    <p className="text-sm text-gray-600">{order.service?.description}</p>
                    {order.bookingDetails && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-2" />
                          {order.bookingDetails.preferredDate}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={14} className="mr-2" />
                          {order.bookingDetails.location}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedOrder(order)
                    setShowModal(true)
                  }}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
                {userType === 'seller' && (
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
                )}
=======
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details #{selectedOrder.id.slice(-8)}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setActiveTab('details')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Eye size={16} className="mr-2" />
                      Order Details
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'tracking'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Truck size={16} className="mr-2" />
                      Order Tracking
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' ? (
                  <>
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
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedOrder.buyerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedOrder.buyerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedOrder.specialInstructions}</p>
                    </div>
                  </div>
                )}

                    {/* Actions */}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    {userType === 'seller' && (
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
                            onClick={() => handleCompleteOrder(selectedOrder.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    )}
=======
=======
>>>>>>> Stashed changes
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
                          onClick={() => handleCompleteOrder(selectedOrder.id)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                  </>
                ) : (
                  /* Tracking Tab */
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Navigation className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Track the progress of this order with real-time updates and location tracking.
                      </p>
                    </div>
                    
                    <OrderTracking 
                      orderId={selectedOrder.id}
                      orderData={selectedOrder}
                      onUpdate={(status) => {
                        // Update local order data when tracking updates
                        setSelectedOrder(prev => ({ ...prev, status }))
                        // Update orders list
                        setOrders(prev => prev.map(order => 
                          order.id === selectedOrder.id ? { ...order, status } : order
                        ))
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectionModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Order</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectOrder}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
