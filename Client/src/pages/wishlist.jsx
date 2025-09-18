import React, { useState } from 'react'
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft, Grid3X3, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

const Wishlist = () => {
  const { items: wishlistItems, removeFromWishlist, clearWishlist, count } = useWishlist()
  const { addToCart } = useCart()
  const [viewMode, setViewMode] = useState('grid')

  const handleCreatorClick = (creator) => {
    console.log('Navigate to creator:', creator.id)
  }

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const handleToggleFavorite = (productId) => {
    removeFromWishlist(productId)
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => addToCart(item))
    clearWishlist()
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <Heart className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't saved any items to your wishlist yet. 
              Start exploring and add items you love!
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Explore Products
            </Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  My Wishlist
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {count} item{count !== 1 ? 's' : ''} saved for later
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMoveAllToCart}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add All to Cart
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wishlist Items */}
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {wishlistItems.map(item => (
            <ProductCard
              key={item.wishlistId || item.id}
              product={item}
              viewMode={viewMode}
              onCreatorClick={handleCreatorClick}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">Items in wishlist</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-purple-600">
                ₹{wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total value</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-green-600">
                {wishlistItems.filter(item => item.originalPrice && item.price < item.originalPrice).length}
              </div>
              <div className="text-sm text-gray-600">Items on sale</div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link 
            to="/products"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Wishlist
