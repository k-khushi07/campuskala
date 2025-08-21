import React from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'

const ProductCard = ({ product, onCreatorClick }) => {
  const {
    id,
    title,
    price,
    image,
    creator,
    rating,
    reviewCount,
    category
  } = product

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
            <Heart size={16} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
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
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
        </div>

        {/* Creator */}
        <button
          onClick={() => onCreatorClick(creator)}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors mb-3"
        >
          by {creator.name}
        </button>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{price}</span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard