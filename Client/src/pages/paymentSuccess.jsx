import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowLeft, ExternalLink } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      if (orderDoc.exists()) {
        setOrderDetails({ id: orderId, ...orderDoc.data() })
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Your order has been placed and payment has been processed successfully.
          </p>
          <p className="text-gray-500">
            You will receive a confirmation email shortly with your order details.
          </p>
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center mb-6">
              <Package className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Payment Successful
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">
                      ₹{orderDetails.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Online Payment</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
                {orderDetails.shippingAddress && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {orderDetails.shippingAddress.name}
                    </p>
                    <p className="text-gray-600">
                      {orderDetails.shippingAddress.email}
                    </p>
                    <p className="text-gray-600">
                      {orderDetails.shippingAddress.phone}
                    </p>
                    <p className="text-gray-600 mt-2">
                      {orderDetails.shippingAddress.address}
                      <br />
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name || item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name || item.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          by {item.creator?.name || 'Unknown Creator'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• You will receive an email confirmation with your order details</p>
            <p>• The seller will review and approve your order</p>
            <p>• You'll be notified when your order is approved and ready for processing</p>
            <p>• Track your order status in the Orders section</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="flex items-center justify-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Package className="w-5 h-5 mr-2" />
            View All Orders
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/contact" className="text-purple-600 hover:text-purple-700 flex items-center">
              <ExternalLink className="w-4 h-4 mr-1" />
              Contact Support
            </a>
            <a href="/faq" className="text-purple-600 hover:text-purple-700">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
