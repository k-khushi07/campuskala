import React from 'react'
import { CreditCard, Smartphone, Banknote, CheckCircle, Shield } from 'lucide-react'
import { mockPaymentService } from '../services/mockPaymentService'

const PaymentOptionsSimple = ({ 
  selectedMethod,
  onMethodSelect,
  loading = false
}) => {
  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: <Banknote className="w-5 h-5" />,
      color: 'green',
      popular: false
    },
    {
      id: 'mock_card',
      name: 'Card Payment (Demo)',
      description: 'Credit/Debit Card - Demo Mode',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'blue',
      popular: true
    },
    {
      id: 'mock_upi',
      name: 'UPI Payment (Demo)',
      description: 'Google Pay, PhonePe, Paytm - Demo Mode',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'purple',
      popular: true
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
              selectedMethod === method.id
                ? `border-${method.color}-500 bg-${method.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !loading && onMethodSelect(method.id)}
          >
            {method.popular && (
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                Popular
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedMethod === method.id
                  ? `bg-${method.color}-100 text-${method.color}-600`
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className="flex items-center">
                {selectedMethod === method.id ? (
                  <CheckCircle className={`w-5 h-5 text-${method.color}-600`} />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Demo Mode</h4>
            <p className="text-sm text-blue-700 mt-1">
              This is a demo payment system. No real payments are processed. Perfect for testing your checkout flow!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentOptionsSimple
