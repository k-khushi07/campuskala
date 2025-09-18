import React from 'react'
import { Package, Truck, CreditCard, Smartphone, Banknote, Lock, Shield, CheckCircle, AlertCircle, Users, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mockPaymentService } from '../services/mockPaymentService'
import multiSellerPaymentService from '../services/multiSellerPaymentService'

const MultiSellerOrderSummary = ({
  items,
  shippingAddress,
  onPaymentMethodSelect,
  selectedPaymentMethod,
  onPlaceOrder,
  loading = false,
  error = null
}) => {
  const { currentUser } = useAuth()

  // Group items by seller and calculate totals
  const sellerGroups = multiSellerPaymentService.groupItemsBySeller(items)
  const sellerTotals = multiSellerPaymentService.calculateSellerTotals(sellerGroups, shippingAddress)
  const paymentSummary = multiSellerPaymentService.createPaymentSummary(sellerTotals)
  const paymentBreakdown = multiSellerPaymentService.getPaymentBreakdown(sellerTotals)

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }
    await onPlaceOrder(selectedPaymentMethod, paymentSummary.summary.grandTotal)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-1">Multi-Seller Order Summary</h2>
        <p className="text-purple-100">
          {paymentSummary.summary.sellerCount} seller(s) • {items.length} item(s)
        </p>
      </div>

      {/* Seller Breakdown */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Order Breakdown by Seller
        </h3>
        
        <div className="space-y-4">
          {paymentBreakdown.map((seller, index) => (
            <div key={seller.sellerId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{seller.sellerName}</h4>
                <span className="text-sm text-gray-500">
                  {seller.itemCount} item{seller.itemCount > 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Items for this seller */}
              <div className="space-y-2 mb-3">
                {seller.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="ml-auto font-medium">
                      {mockPaymentService.formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Seller totals */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{mockPaymentService.formatCurrency(seller.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {seller.shipping === 0 ? 'FREE' : mockPaymentService.formatCurrency(seller.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span>{mockPaymentService.formatCurrency(seller.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {mockPaymentService.formatCurrency(seller.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          Shipping Address
        </h3>
        {shippingAddress.name && shippingAddress.address ? (
          <div className="text-gray-700">
            <p className="font-medium">{shippingAddress.name}</p>
            <p>{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
            <p>Phone: {shippingAddress.phone}</p>
            <p>Email: {shippingAddress.email}</p>
          </div>
        ) : (
          <p className="text-gray-500">Please enter your shipping address.</p>
        )}
      </div>

      {/* Grand Total */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal ({items.length} items)</span>
            <span>{mockPaymentService.formatCurrency(paymentSummary.summary.totalSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Fee</span>
            <span>
              {paymentSummary.summary.totalShipping === 0 
                ? 'FREE' 
                : mockPaymentService.formatCurrency(paymentSummary.summary.totalShipping)
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taxes (GST 18%)</span>
            <span>{mockPaymentService.formatCurrency(paymentSummary.summary.totalTax)}</span>
          </div>
          <hr className="my-3 border-gray-300" />
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Grand Total</span>
            <span className="text-purple-600">
              {mockPaymentService.formatCurrency(paymentSummary.summary.grandTotal)}
            </span>
          </div>
          <div className="text-sm text-gray-600 text-center mt-2">
            Paying {paymentSummary.summary.sellerCount} seller{paymentSummary.summary.sellerCount > 1 ? 's' : ''} in one transaction
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
              <span>
                Place Order - {mockPaymentService.formatCurrency(paymentSummary.summary.grandTotal)}
              </span>
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

        {/* Multi-Seller Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Multi-Seller Order</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your order contains items from {paymentSummary.summary.sellerCount} different seller{paymentSummary.summary.sellerCount > 1 ? 's' : ''}. 
                Each seller will receive their portion of the payment and process your items separately.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Secure Multi-Seller Payment</h4>
              <p className="text-sm text-green-700 mt-1">
                Your payment is processed securely and automatically distributed to each seller. 
                You'll receive separate confirmations from each seller.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiSellerOrderSummary
