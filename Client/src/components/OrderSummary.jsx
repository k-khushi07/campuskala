import React from 'react'
import { Package, Truck, CreditCard, Smartphone, Banknote, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { paymentService } from '../services/payment'

const OrderSummary = ({ 
  items, 
  shippingAddress, 
  onPaymentMethodSelect, 
  selectedPaymentMethod,
  onPlaceOrder,
  loading = false,
  error = null
}) => {
  const { currentUser } = useAuth()

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = subtotal > 1000 ? 0 : 100 // Free shipping over ₹1000
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shippingCost + tax

  // Simplified payment methods
  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: <Banknote className="w-5 h-5" />,
      available: true,
      color: 'green'
    },
    {
      id: 'card',
      name: 'Card Payment',
      description: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      available: true,
      color: 'blue'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm',
      icon: <Smartphone className="w-5 h-5" />,
      available: true,
      color: 'purple'
    }
  ]

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }
    await onPlaceOrder(selectedPaymentMethod, total)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Package className="mr-3" size={28} />
          Order Summary
        </h2>
        <p className="text-purple-100 mt-1">Review your order before payment</p>
      </div>

      {/* Order Items */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id || index} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.image || item.images?.[0] || 'https://via.placeholder.com/150'} 
                  alt={item.name || item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.name || item.title}
                </h4>
                <p className="text-sm text-gray-600">
                  by {item.creator?.name || 'Unknown Creator'}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × {paymentService.formatCurrency(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {paymentService.formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      {shippingAddress && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="mr-2" size={20} />
            Shipping Address
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{shippingAddress.name}</p>
            <p className="text-gray-600">{shippingAddress.email}</p>
            <p className="text-gray-600">{shippingAddress.phone}</p>
            <p className="text-gray-600 mt-2">
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
            </p>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{paymentService.formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                paymentService.formatCurrency(shippingCost)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (GST 18%)</span>
            <span className="font-medium">{paymentService.formatCurrency(tax)}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-purple-600">{paymentService.formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Place Order Section */}
      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !selectedPaymentMethod || !currentUser}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Place Order - {paymentService.formatCurrency(total)}</span>
            </>
          )}
        </button>

        {!currentUser && (
          <p className="text-sm text-red-600 mt-3 text-center">
            Please log in to place your order
          </p>
        )}

        {!selectedPaymentMethod && (
          <p className="text-sm text-orange-600 mt-3 text-center">
            Please select a payment method
          </p>
        )}

        {/* Security Features */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Secure Checkout</h4>
              <p className="text-sm text-green-700 mt-1">
                Your information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
