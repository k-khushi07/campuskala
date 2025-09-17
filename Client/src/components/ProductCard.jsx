import React, { useState } from 'react'
import { Heart, ShoppingCart, Star, Eye, Share2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import DetailModal from './DetailModal'

const ProductCard = ({ product, onCreatorClick, onAddToCart, onToggleFavorite }) => {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const {
    id,
    title,
    price,
    originalPrice,
    image,
    creator,
    rating,
    reviewCount,
    category,
    isHandmade,
    isEcoFriendly,
    inStock = true
  } = product

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  const { addToCart } = useCart()
  const handleAddToCart = () => {
    try {
      addToCart(product)
      onAddToCart?.(product)
    } catch (e) {
      console.error('Add to cart failed', e)
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    onToggleFavorite?.(id)
  }

  const handleQuickView = () => {
    setShowDetailModal(true)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this ${category.toLowerCase()} by ${creator.name}`,
        url: window.location.href + `/products/${id}`
      })
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative cursor-pointer" onClick={handleQuickView}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${!imageLoaded ? 'bg-gray-200 animate-pulse' : ''}`}
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleQuickView()
              }} 
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} className="text-gray-700" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }} 
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {discount}% OFF
            </span>
          )}
          {isHandmade && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              🤚 Handmade
            </span>
          )}
          {isEcoFriendly && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              🌱 Eco-Friendly
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleToggleWishlist()
            }}
            className={`p-2 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Stock status */}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors" 
          title={title}
        >
          {title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.floor(rating) ? "currentColor" : "none"}
                className="text-yellow-400"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {rating?.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>

        {/* Creator */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreatorClick(creator)
          }}
          className="text-sm text-gray-600 hover:text-purple-600 transition-colors mb-3 flex items-center space-x-1"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
          <span>by {creator.name}</span>
          {creator.isVerified && <span className="text-blue-500">✓</span>}
        </button>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
            disabled={!inStock}
            className={`p-2 rounded-lg transition-colors ${inStock ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>

    {/* Detail Modal */}
    <DetailModal
      item={product}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      type="product"
      onCreatorClick={onCreatorClick}
    />
    </>
  )
}

export default ProductCard
