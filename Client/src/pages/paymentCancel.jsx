import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { XCircle, ArrowLeft, CreditCard, RefreshCw } from 'lucide-react'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-600 mb-2">
            Your payment was cancelled and no charges have been made.
          </p>
          <p className="text-gray-500">
            Your items are still in your cart and you can try again anytime.
          </p>
        </div>

        {/* Order Information */}
        {orderId && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Order ID:</p>
              <p className="font-mono text-gray-900">{orderId}</p>
            </div>
          </div>
        )}

        {/* Reasons for Cancellation */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-yellow-900 mb-4">Common Reasons for Payment Cancellation</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>• You cancelled the payment process</p>
            <p>• Payment gateway timeout</p>
            <p>• Insufficient funds or card declined</p>
            <p>• Technical issues during payment</p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">Having Payment Issues?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• Ensure you have sufficient funds in your account</p>
            <p>• Check that your card details are correct</p>
            <p>• Try using a different payment method</p>
            <p>• Contact your bank if the issue persists</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/cart"
            className="flex items-center justify-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Alternative Payment Methods */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Alternative Payment Methods</h3>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center text-gray-600">
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Credit/Debit Card</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>UPI</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>Net Banking</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>Digital Wallets</span>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">Need help with payment?</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/contact" className="text-purple-600 hover:text-purple-700">
              Contact Support
            </a>
            <a href="/faq" className="text-purple-600 hover:text-purple-700">
              Payment FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel
