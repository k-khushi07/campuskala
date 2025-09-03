import React, { useState } from 'react'
import { Clock, Star, MapPin, Award } from 'lucide-react'

const ServiceCard = ({ service, onCreatorClick, onBookingClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  
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
    location,
    availability,
    isPopular,
    completedOrders
  } = service

  const handleBookNow = () => {
    onBookingClick?.(service)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Service Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${
            !imageLoaded ? 'bg-gray-200 animate-pulse' : ''
          }`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
          {isPopular && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <Award size={10} className="mr-1" />
              Popular
            </span>
          )}
        </div>

        {/* Availability Indicator */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            availability === 'available' 
              ? 'bg-green-100 text-green-800' 
              : availability === 'busy'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {availability === 'available' ? '🟢 Available' : 
             availability === 'busy' ? '🟡 Busy' : 
             '🔴 Unavailable'}
          </span>
        </div>
      </div>

      {/* Service Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 cursor-pointer transition-colors" onClick={() => onCreatorClick(creator)}>
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
          onClick={() => onCreatorClick(creator)}
          className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-3 flex items-center space-x-1"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
          <span>by {creator.name}</span>
          {creator.isVerified && <span className="text-blue-500">✓</span>}
          {completedOrders && <span className="text-xs text-gray-500">({completedOrders} orders)</span>}
        </button>

        {/* Service Details */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              {duration}
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={12} className="mr-1" />
            {location}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{priceRange}</span>
            <p className="text-xs text-gray-500">Starting price</p>
          </div>
          <button
            onClick={handleBookNow}
            disabled={availability !== 'available'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              availability === 'available'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {availability === 'available' ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
