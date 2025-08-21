import React from 'react'
import { Clock, Star, MapPin } from 'lucide-react'

const ServiceCard = ({ service, onCreatorClick }) => {
  const {
    id,
    title,
    priceRange,
    image,
    creator,
    rating,
    reviewCount,
    category,
    duration,
    location
  } = service

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Service Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Service Info */}
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

        {/* Service Details */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            {duration}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={12} className="mr-1" />
            {location}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{priceRange}</span>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard