import React, { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, Heart, ArrowLeft, Shield, Truck, RotateCcw, Star } from 'lucide-react'

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'Hand-painted Canvas Art',
      price: 1200,
      originalPrice: 1500,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      creator: {
        id: 1,
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100'
      },
      category: 'Art',
      inStock: true,
      maxQuantity: 3,
      discount: 20,
      deliveryTime: '3-5 days'
    },
    {
      id: 2,
      title: 'Handmade Jewelry Set',
      price: 800,
      originalPrice: 950,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
      creator: {
        id: 2,
        name: 'Anita Kumar',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      },
      category: 'Fashion',
      inStock: true,
      maxQuantity: 2,
      discount: 16,
      deliveryTime: '2-3 days'
    },
    {
      id: 3,
      title: 'Ceramic Coffee Mug',
      price: 350,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300',
      creator: {
        id: 3,
        name: 'Sonal Dave',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
      },
      category: 'Home',
      inStock: true,
      maxQuantity: 5,
      deliveryTime: '1-2 days'
    }
  ])

  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) } : item
      )
    )
  }

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const moveToWishlist = (id) => {
    // Handle move to wishlist
    console.log('Move to wishlist:', id)
    removeItem(id)
  }

  const applyPromoCode = () => {
    // Mock promo code validation
    const promoCodes = {
      'STUDENT10': { discount: 10, type: 'percentage' },
      'FIRST20': { discount: 20, type: 'percentage' },
      'SAVE100': { discount: 100, type: 'fixed' }
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

  const deliveryFee = subtotal > 1000 ? 0 : 50
  const total = subtotal - promoDiscount + deliveryFee

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any amazing creations to your cart yet. 
              Let's find something special for you!
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{cartItems.length} items in your cart</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={item.creator.avatar}
                                alt={item.creator.name}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm text-gray-600">by {item.creator.name}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{item.category}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-semibold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.originalPrice && (
                                <>
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-green-600 font-medium">
                                    {item.discount}% off
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center text-sm text-gray-600 mb-4">
                              <Truck size={16} className="mr-1" />
                              <span>Delivery in {item.deliveryTime}</span>
                              {item.inStock ? (
                                <span className="ml-4 text-green-600">In Stock</span>
                              ) : (
                                <span className="ml-4 text-red-600">Out of Stock</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-3 py-2 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            {item.quantity >= item.maxQuantity && (
                              <span className="text-sm text-orange-600">Max quantity reached</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => moveToWishlist(item.id)}
                              className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Heart size={16} className="mr-1" />
                              Save for later
                            </button>
                            <span className="text-lg font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      disabled={!!appliedPromo}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {appliedPromo ? (
                      <button
                        onClick={removePromoCode}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={applyPromoCode}
                        disabled={!promoCode}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-sm text-green-700 font-medium">
                        {appliedPromo.code} applied! 
                        {appliedPromo.type === 'percentage' 
                          ? ` ${appliedPromo.discount}% off` 
                          : ` ₹${appliedPromo.discount} off`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>You're saving</span>
                      <span>-₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {appliedPromo && promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo discount ({appliedPromo.code})</span>
                      <span>-₹{promoDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <span>₹{deliveryFee}</span>
                    )}
                  </div>

                  {deliveryFee > 0 && (
                    <p className="text-sm text-gray-500">
                      Add ₹{(1000 - subtotal).toLocaleString()} more for free delivery
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <Shield className="mx-auto text-green-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <Truck className="mx-auto text-blue-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="mx-auto text-purple-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Easy Returns</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mt-6">
                  Proceed to Checkout
                </button>

                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart