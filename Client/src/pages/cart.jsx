import React, { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, Heart, ArrowLeft, Shield, Truck, RotateCcw, Award, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { items: cartItems, updateQuantity: setQty, removeFromCart } = useCart()

  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [deliveryOption, setDeliveryOption] = useState('standard')

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setQty(id, newQuantity)
  }

  const removeItem = (id) => {
    removeFromCart(id)
  }

  const moveToWishlist = (id) => {
    console.log('Move to wishlist:', id)
    removeItem(id)
  }

  const applyPromoCode = () => {
    const promoCodes = {
      'STUDENT10': { discount: 10, type: 'percentage', description: 'Student Discount' },
      'FIRST20': { discount: 20, type: 'percentage', description: 'First Purchase' },
      'CAMPUS50': { discount: 50, type: 'fixed', description: 'Campus Special' },
      'SUSTAINABLE': { discount: 15, type: 'percentage', description: 'Eco-Friendly Bonus' },
      'CREATOR': { discount: 100, type: 'fixed', description: 'Creator Support Fund' }
    }

    if (promoCodes[promoCode]) {
      setAppliedPromo({
        code: promoCode,
        ...promoCodes[promoCode]
      })
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode('')
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity)
    }
    return sum
  }, 0)

  const promoDiscount = appliedPromo ? (
    appliedPromo.type === 'percentage' 
      ? (subtotal * appliedPromo.discount / 100)
      : appliedPromo.discount
  ) : 0

  const campusItemsCount = cartItems.filter(item => item.campusPickup).length
  const getDeliveryFee = () => {
    if (deliveryOption === 'campus') return 0
    if (deliveryOption === 'express') return 100
    return subtotal > 1000 ? 0 : 50
  }
  const deliveryFee = getDeliveryFee()

  const total = Math.max(0, subtotal - promoDiscount + deliveryFee)

  const sustainableItems = cartItems.filter(item => item.isEcoFriendly || item.isHandmade).length
  const supportedCreators = [...new Set(cartItems.map(item => item.creator.id))].length

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="text-purple-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any amazing creations to your cart yet. 
              Let's find something special made by your fellow students!
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Explore Student Creations
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Better Mobile Alignment */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Shopping Cart
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {cartItems.length} items • Supporting {supportedCreators} creators
                </p>
              </div>
            </div>
            
            {/* SDG Impact Preview - Hidden on small screens */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              {sustainableItems > 0 && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Leaf size={16} />
                  <span>{sustainableItems} sustainable items</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-purple-600">
                <Award size={16} />
                <span>Supporting campus creators</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items with Improved Mobile Layout */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Product Image and Details Row */}
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                          />
                          {/* Badges on image */}
                          <div className="absolute -top-1 -right-1 flex flex-col space-y-1">
                            {item.isHandmade && (
                              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full text-center">
                                🤚
                              </span>
                            )}
                            {item.isEcoFriendly && (
                              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full text-center">
                                🌱
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                                {item.title}
                              </h3>
                              
                              {/* Enhanced creator info */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <img
                                  src={item.creator.avatar}
                                  alt={item.creator.name}
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow"
                                />
                                <span className="text-xs sm:text-sm text-gray-600">by {item.creator.name}</span>
                                {item.creator.isVerified && (
                                  <span className="text-blue-500 text-xs">✓</span>
                                )}
                                <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                  {item.creator.campusYear}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {item.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-lg font-semibold text-gray-900">
                                  ₹{item.price.toLocaleString()}
                                </span>
                                {item.originalPrice && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{item.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-xs sm:text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                      {item.discount}% off
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Delivery and pickup options - Mobile optimized */}
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 sm:gap-4">
                                <div className="flex items-center">
                                  <Truck size={14} className="mr-1 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm">Delivery in {item.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.campusPickup && (
                                    <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                      📍 Campus Pickup Available
                                    </span>
                                  )}
                                  {item.inStock ? (
                                    <span className="text-green-600 font-medium text-xs sm:text-sm">✓ In Stock</span>
                                  ) : (
                                    <span className="text-red-600 font-medium text-xs sm:text-sm">✗ Out of Stock</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Remove Button - Top right on mobile */}
                            <div className="flex sm:flex-col items-end justify-end">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={18} className="sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quantity and Actions Row - Mobile optimized */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-2 min-w-[2.5rem] text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          {/* Max quantity warning */}
                          {item.quantity >= item.maxQuantity && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full whitespace-nowrap">
                              Max reached
                            </span>
                          )}
                        </div>

                        {/* Price and wishlist */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Heart size={14} className="mr-1" />
                            <span className="hidden sm:inline">Save for later</span>
                            <span className="sm:hidden">Save</span>
                          </button>
                          <span className="text-lg font-semibold text-purple-600">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Order Summary with Better Mobile Alignment */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm sticky top-6">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Delivery Options with Better Mobile Layout */}
                {campusItemsCount > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="delivery"
                          value="campus"
                          checked={deliveryOption === 'campus'}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="mr-3 text-purple-600 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm font-medium">Campus Pickup</span>
                          <span className="text-sm text-purple-600 font-medium">FREE</span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="delivery"
                          value="standard"
                          checked={deliveryOption === 'standard'}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="mr-3 text-purple-600 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm">Standard Delivery (3-5 days)</span>
                          <span className="text-sm text-gray-600 font-medium">
                            {subtotal > 1000 ? 'FREE' : '₹50'}
                          </span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="delivery"
                          value="express"
                          checked={deliveryOption === 'express'}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="mr-3 text-purple-600 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm">Express Delivery (1-2 days)</span>
                          <span className="text-sm text-gray-600 font-medium">₹100</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Enhanced Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="STUDENT10, CAMPUS50..."
                      disabled={!!appliedPromo}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-sm"
                    />
                    {appliedPromo ? (
                      <button
                        onClick={removePromoCode}
                        className="px-3 sm:px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={applyPromoCode}
                        disabled={!promoCode}
                        className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700 font-medium">
                          {appliedPromo.code} Applied!
                        </span>
                        <span className="text-sm text-green-600">
                          {appliedPromo.type === 'percentage' 
                            ? `${appliedPromo.discount}% off` 
                            : `₹${appliedPromo.discount} off`
                          }
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">{appliedPromo.description}</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown with Better Alignment */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>You're saving</span>
                      <span className="font-medium">-₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {appliedPromo && promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Promo discount ({appliedPromo.code})</span>
                      <span className="font-medium">-₹{Math.round(promoDiscount).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Delivery fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <span className="font-medium">₹{deliveryFee}</span>
                    )}
                  </div>

                  {deliveryFee > 0 && subtotal < 1000 && deliveryOption === 'standard' && (
                    <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                      💡 Add ₹{(1000 - subtotal).toLocaleString()} more for free delivery
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-lg font-semibold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {/* SDG Impact Section */}
                {sustainableItems > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">🌍 Your Impact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Sustainable items</span>
                        <span className="font-medium text-green-600">{sustainableItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Student creators supported</span>
                        <span className="font-medium text-purple-600">{supportedCreators}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supporting SDG 8 (Decent Work) & SDG 12 (Responsible Consumption)
                    </p>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <Shield className="mx-auto text-green-600 mb-1" size={18} />
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <Truck className="mx-auto text-purple-600 mb-1" size={18} />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="mx-auto text-blue-600 mb-1" size={18} />
                    <span className="text-xs text-gray-600">Easy Returns</span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3 pt-4">
                  <Link 
                    to="/checkout"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-center block"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link 
                    to="/products"
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Creator Support Banner */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
              <div className="text-center">
                <Award size={24} className="mx-auto mb-2" />
                <h3 className="font-semibold mb-1 text-base">Supporting Campus Creators</h3>
                <p className="text-sm opacity-90">
                  Your purchase directly supports {supportedCreators} student{supportedCreators !== 1 ? 's' : ''} in their creative journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
