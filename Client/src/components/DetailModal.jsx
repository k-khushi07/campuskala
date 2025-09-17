import React, { useState, useEffect } from 'react'
import { X, Heart, ShoppingCart, Star, Share2, Clock, MapPin, Award, Truck, Shield, RotateCcw, Leaf, User, Calendar, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'

const DetailModal = ({ 
  item, 
  isOpen, 
  onClose, 
  type = 'product', // 'product' or 'service'
  onCreatorClick,
  onBookingClick 
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [bookingDetails, setBookingDetails] = useState({
    preferredDate: '',
    preferredTime: '',
    location: '',
    requirements: ''
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const { addToCart } = useCart()
  const { currentUser, userProfile } = useAuth()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedImage(0)
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  const {
    id,
    title,
    price,
    originalPrice,
    image,
    images = [image], // Support multiple images
    creator,
    rating,
    reviewCount,
    category,
    description,
    tags = [],
    inStock = true,
    isHandmade,
    isEcoFriendly,
    deliveryTime,
    campusPickup,
    maxQuantity = 10,
    // Service specific fields
    priceRange,
    minPrice,
    maxPrice,
    duration,
    location,
    locationType,
    availability,
    isPopular,
    completedOrders
  } = item

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const isService = type === 'service'

  const handleAddToCart = () => {
    if (isService) return
    
    try {
      const productToAdd = {
        ...item,
        quantity: quantity
      }
      addToCart(productToAdd)
      onClose()
    } catch (e) {
      console.error('Add to cart failed', e)
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this ${category.toLowerCase()} by ${creator.name}`,
        url: window.location.href
      })
    }
  }

  const handleBookNow = () => {
    if (isService) {
      if (!currentUser) {
        alert('Please log in to book this service')
        return
      }
      setShowBookingForm(true)
    }
  }

  const handleServiceBooking = async () => {
    if (!currentUser) {
      alert('Please log in to book this service')
      return
    }

    try {
      const buyerInfo = {
        id: currentUser.uid,
        name: userProfile?.displayName || 'User',
        email: currentUser.email || '',
        address: 'To be provided',
        instructions: bookingDetails.requirements || ''
      }

      const order = await orderService.createServiceOrder(item, buyerInfo, bookingDetails)
      
      alert('Service booking request sent! The service provider will review and approve your request.')
      setShowBookingForm(false)
      onClose()
    } catch (error) {
      console.error('Error booking service:', error)
      alert('Failed to book service. Please try again.')
    }
  }

  const handleCreatorClick = () => {
    onCreatorClick?.(creator)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
            {/* Image Section */}
            <div className="lg:w-1/2 bg-gray-100">
              <div className="relative h-64 lg:h-full">
                <img
                  src={images[selectedImage] || image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation (if multiple images) */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          selectedImage === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  <span className={`text-white text-xs px-3 py-1 rounded-full font-medium ${
                    isService ? 'bg-green-600' : 'bg-purple-600'
                  }`}>
                    {category}
                  </span>
                  
                  {!isService && discount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {discount}% OFF
                    </span>
                  )}
                  
                  {isHandmade && (
                    <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      🤚 Handmade
                    </span>
                  )}
                  
                  {isEcoFriendly && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      🌱 Eco-Friendly
                    </span>
                  )}
                  
                  {isService && isPopular && (
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
                      <Award size={10} className="mr-1" />
                      Popular
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-4 right-12">
                  <button 
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-full shadow-lg transition-colors ${
                      isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Share Button */}
                <div className="absolute top-16 right-12">
                  <button 
                    onClick={handleShare}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Title and Rating */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(rating) ? "currentColor" : "none"}
                          className="text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating?.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Creator Info */}
                <div 
                  onClick={handleCreatorClick}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                    <p className="text-sm text-gray-600">
                      {isService ? 'Service Provider' : 'Product Creator'}
                      {creator.isVerified && <span className="text-blue-500 ml-1">✓</span>}
                    </p>
                    {completedOrders && (
                      <p className="text-xs text-gray-500">{completedOrders} completed orders</p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  {isService ? (
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{priceRange}</div>
                      <p className="text-sm text-gray-600">Starting price</p>
                      {minPrice && maxPrice && (
                        <p className="text-xs text-gray-500 mt-1">
                          Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                      {originalPrice && (
                        <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                      )}
                      {discount > 0 && (
                        <span className="text-sm text-green-600 font-medium">Save ₹{(originalPrice - price).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Service Details */}
                {isService && (
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">{duration}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">{location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm capitalize">{locationType} service</span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      availability === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {availability === 'available' ? '🟢 Available Now' : 
                       availability === 'busy' ? '🟡 Currently Busy' : 
                       '🔴 Unavailable'}
                    </div>
                  </div>
                )}

                {/* Product Details */}
                {!isService && (
                  <div className="space-y-3">
                    {deliveryTime && (
                      <div className="flex items-center text-gray-600">
                        <Truck size={16} className="mr-2" />
                        <span className="text-sm">Delivery in {deliveryTime}</span>
                      </div>
                    )}
                    {campusPickup && (
                      <div className="flex items-center text-purple-600">
                        <MapPin size={16} className="mr-2" />
                        <span className="text-sm font-medium">📍 Campus Pickup Available</span>
                      </div>
                    )}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {description || `This is a beautiful ${category.toLowerCase()} created by ${creator.name}. Perfect for students looking for unique and creative ${isService ? 'services' : 'products'}.`}
                  </p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector (Products only) */}
                {!isService && inStock && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">Max: {maxQuantity}</span>
                    </div>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Shield className="mx-auto text-green-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <Truck className="mx-auto text-purple-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="mx-auto text-blue-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Easy Returns</span>
                  </div>
                </div>

                {/* Service Booking Form */}
                {isService && showBookingForm && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-gray-900 mb-4">Book This Service</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Date
                          </label>
                          <input
                            type="date"
                            value={bookingDetails.preferredDate}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, preferredDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Time
                          </label>
                          <input
                            type="time"
                            value={bookingDetails.preferredTime}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, preferredTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Where would you like the service?"
                          value={bookingDetails.location}
                          onChange={(e) => setBookingDetails(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requirements
                        </label>
                        <textarea
                          placeholder="Any specific requirements or notes..."
                          value={bookingDetails.requirements}
                          onChange={(e) => setBookingDetails(prev => ({ ...prev, requirements: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  {isService ? (
                    <>
                      {!showBookingForm ? (
                        <button
                          onClick={handleBookNow}
                          disabled={availability !== 'available'}
                          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                            availability === 'available'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {availability === 'available' ? 'Book Now' : 'Unavailable'}
                        </button>
                      ) : (
                        <div className="flex space-x-2 flex-1">
                          <button
                            onClick={handleServiceBooking}
                            className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Send Booking Request
                          </button>
                          <button
                            onClick={() => setShowBookingForm(false)}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                        inStock 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleCreatorClick}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle size={16} />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailModal
