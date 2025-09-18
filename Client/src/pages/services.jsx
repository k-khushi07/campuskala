import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtimeServices } from '../hooks/useRealtime'
import { useCart } from '../context/CartContext'
import { Search, Filter, MapPin, Clock, Star, Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import ServiceRecommendationChatbot from '../components/ServiceRecommendationChatbot'

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [location, setLocation] = useState('all')
  const [duration, setDuration] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'tutoring', name: 'Tutoring & Education' },
    { id: 'photography', name: 'Photography' },
    { id: 'music', name: 'Music Lessons' },
    { id: 'tech', name: 'Tech Support' },
    { id: 'design', name: 'Design & Creative' },
    { id: 'fitness', name: 'Fitness & Wellness' },
    { id: 'language', name: 'Language Learning' },
  ]

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'campus', name: 'On Campus' },
    { id: 'online', name: 'Online' },
    { id: 'hybrid', name: 'Hybrid' },
    { id: 'nearby', name: 'Near Campus' },
  ]

  const durations = [
    { id: 'all', name: 'Any Duration' },
    { id: 'short', name: '< 1 hour' },
    { id: 'medium', name: '1-2 hours' },
    { id: 'long', name: '2+ hours' },
    { id: 'ongoing', name: 'Ongoing' },
  ]

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  const { services: servicesRealtime, loading } = useRealtimeServices()
  const services = servicesRealtime
  const { addToCart } = useCart()

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesLocation = location === 'all' || service.locationType === location
    const matchesPrice = service.maxPrice >= priceRange[0] && service.minPrice <= priceRange[1]
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id
      case 'price-low':
        return a.minPrice - b.minPrice
      case 'price-high':
        return b.maxPrice - a.maxPrice
      case 'rating':
        return b.rating - a.rating
      default:
        return b.completedOrders - a.completedOrders
    }
  })

  const handleCreatorClick = (creator) => {
    console.log('Navigate to creator:', creator.id)
  }

  const handleBookService = (service) => {
    const cartItem = {
      id: `service-${service.id}`,
      title: service.title,
      price: service.minPrice || 0,
      image: service.image,
      type: 'service',
      category: service.category || 'service',
      inStock: true,
      maxQuantity: 10,
      deliveryTime: '2-5 days',
      campusPickup: false,
      creator: {
        id: service.creator?.id || 'service-creator',
        name: service.creator?.name || 'Service Provider',
        avatar: service.creator?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        isVerified: (service.creator?.isVerified ?? service.creator?.verified) || false,
        campusYear: service.creator?.campusYear || '—'
      }
    }
    addToCart(cartItem)
    navigate('/cart')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
              <p className="text-gray-600 mt-1">Find expert help from talented students</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Quick Filters</h4>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Top Rated</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Available Today</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Verified Creators</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                </button>
                <span className="text-sm text-gray-600">
                  {sortedServices.length} services found
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : sortedServices.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onCreatorClick={handleCreatorClick}
                    onBookingClick={handleBookService}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setLocation('all')
                    setPriceRange([0, 30000])
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Featured Services Section */}
            {sortedServices.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Need Help Finding the Right Service?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Meet Nova, our AI assistant who can help match you with the perfect service provider for your needs.
                  </p>
                  <button onClick={() => setShowChatbot(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Get Personalized Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Recommendation Chatbot */}
      <ServiceRecommendationChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        services={services}
      />
    </div>
  )
}

export default Services