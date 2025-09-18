import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Loader2
} from 'lucide-react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { stripeService } from '../services/stripe'
import { paymentService } from '../services/payment'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PaymentOptions = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError,
  selectedMethod,
  onMethodSelect,
  loading = false
}) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod || 'stripe_card')
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [cardElementReady, setCardElementReady] = useState(false)

  useEffect(() => {
    if (selectedMethod) {
      setPaymentMethod(selectedMethod)
    }
  }, [selectedMethod])

  const paymentMethods = [
    {
      id: 'stripe_card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay, Amex',
      icon: <CreditCard className="w-6 h-6" />,
      available: true,
      processingFee: 0,
      color: 'blue'
    },
    {
      id: 'stripe_upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: <Smartphone className="w-6 h-6" />,
      available: true,
      processingFee: 0,
      color: 'green'
    },
    {
      id: 'stripe_netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: <Banknote className="w-6 h-6" />,
      available: true,
      processingFee: 0,
      color: 'purple'
    },
    {
      id: 'stripe_wallets',
      name: 'Digital Wallets',
      description: 'Paytm, Mobikwik, Freecharge',
      icon: <Smartphone className="w-6 h-6" />,
      available: true,
      processingFee: 0,
      color: 'orange'
    }
  ]

  const handleMethodSelect = (methodId) => {
    setPaymentMethod(methodId)
    setShowCardDetails(methodId === 'stripe_card')
    onMethodSelect(methodId)
  }

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'stripe_card') {
        // Card payment will be handled by Stripe Elements
        return
      } else {
        // Handle other payment methods
        await processAlternativePayment(paymentMethod)
      }
    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError(error.message || 'Payment failed. Please try again.')
    }
  }

  const processAlternativePayment = async (method) => {
    try {
      // Create checkout session for UPI, Net Banking, or Wallets
      const session = await stripeService.createCheckoutSession(
        [{
          name: 'Order Payment',
          description: 'Payment for your order',
          price: amount,
          quantity: 1
        }],
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/payment/cancel`,
        {
          payment_method_types: [method.replace('stripe_', '')],
          mode: 'payment'
        }
      )

      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout(session.id)
    } catch (error) {
      console.error('Alternative payment error:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                paymentMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.available && handleMethodSelect(method.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  paymentMethod === method.id
                    ? `bg-${method.color}-100 text-${method.color}-600`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {method.processingFee > 0 && (
                    <p className="text-xs text-orange-600">
                      +{paymentService.formatCurrency(method.processingFee)} processing fee
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  {paymentMethod === method.id ? (
                    <CheckCircle className={`w-6 h-6 text-${method.color}-600`} />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {paymentMethod && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Payment Details</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
          </div>

          {paymentMethod === 'stripe_card' ? (
            <Elements stripe={stripePromise}>
              <CardPaymentForm 
                amount={amount}
                onSuccess={onPaymentSuccess}
                onError={onPaymentError}
                loading={loading}
              />
            </Elements>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount to Pay</span>
                  <span className="text-xl font-bold text-gray-900">
                    {paymentService.formatCurrency(amount)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900">Payment Instructions</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      {paymentMethod === 'stripe_upi' && 
                        'You will be redirected to your UPI app to complete the payment. Please ensure your UPI app is installed and configured.'
                      }
                      {paymentMethod === 'stripe_netbanking' && 
                        'You will be redirected to your bank\'s secure payment page. Please log in with your net banking credentials.'
                      }
                      {paymentMethod === 'stripe_wallets' && 
                        'You will be redirected to your digital wallet to complete the payment. Please ensure you have sufficient balance.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Pay {paymentService.formatCurrency(amount)}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Information */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900">Your Payment is Secure</h4>
            <div className="mt-2 space-y-1 text-sm text-green-700">
              <p>• 256-bit SSL encryption protects your data</p>
              <p>• We never store your payment information</p>
              <p>• All transactions are processed securely by Stripe</p>
              <p>• PCI DSS compliant payment processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Card Payment Form Component
const CardPaymentForm = ({ amount, onSuccess, onError, loading }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [cardComplete, setCardComplete] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        'inr',
        {
          orderType: 'checkout',
          timestamp: new Date().toISOString()
        }
      )

      // Confirm payment
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      )

      if (error) {
        onError(error.message)
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        onSuccess(confirmedPaymentIntent)
      }
    } catch (error) {
      console.error('Payment error:', error)
      onError(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCardChange = (event) => {
    setCardComplete(event.complete)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !cardComplete || processing || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {processing || loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pay {paymentService.formatCurrency(amount)}</span>
          </>
        )}
      </button>
    </form>
  )
}

export default PaymentOptions
