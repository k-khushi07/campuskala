import React, { useState } from 'react'
import { Search, Filter, MapPin, Clock, Star, Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [location, setLocation] = useState('all')
  const [duration, setDuration] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

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

  const services = [
    {
      id: 1,
      title: 'Portrait Photography Session',
      priceRange: '₹1500-3000',
      minPrice: 1500,
      maxPrice: 3000,
      image: 'https://images.unsplash.com/photo-1554048612-b6ebae896fb5?w=400',
      creator: { 
        id: 1, 
        name: 'Aditi Mehta', 
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        verified: true 
      },
      rating: 4.9,
      reviewCount: 28,
      category: 'photography',
      duration: '2-3 hours',
      location: 'Campus & Nearby',
      locationType: 'hybrid',
      tags: ['portrait', 'graduation', 'professional'],
      description: 'Professional portrait photography for graduation, LinkedIn, or personal use.',
      availability: 'Available this week',
      responseTime: '< 2 hours',
      completedOrders: 45,
      isTopRated: true
    },
    {
      id: 2,
      title: 'Guitar Lessons (Beginner to Intermediate)',
      priceRange: '₹500-800/hr',
      minPrice: 500,
      maxPrice: 800,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
      creator: { 
        id: 2, 
        name: 'Arjun Reddy', 
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        verified: true 
      },
      rating: 4.8,
      reviewCount: 22,
      category: 'music',
      duration: '1 hour',
      location: 'Music Room',
      locationType: 'campus',
      tags: ['guitar', 'acoustic', 'beginner'],
      description: 'Learn guitar from basics to intermediate level. Acoustic and electric guitar lessons available.',
      availability: 'Available daily',
      responseTime: '< 1 hour',
      completedOrders: 67,
      isTopRated: true
    },
    {
      id: 3,
      title: 'Web Development Tutoring',
      priceRange: '₹800-1200/hr',
      minPrice: 800,
      maxPrice: 1200,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400',
      creator: { 
        id: 3, 
        name: 'Sneha Gupta', 
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        verified: true 
      },
      rating: 4.7,
      reviewCount: 19,
      category: 'tech',
      duration: '1-2 hours',
      location: 'Online/Campus',
      locationType: 'hybrid',
      tags: ['react', 'javascript', 'web development'],
      description: 'Personalized web development tutoring covering HTML, CSS, JavaScript, React and more.',
      availability: 'Available weekends',
      responseTime: '< 4 hours',
      completedOrders: 34,
      isTopRated: false
    },
    {
      id: 4,
      title: 'Math & Physics Tutoring',
      priceRange: '₹400-600/hr',
      minPrice: 400,
      maxPrice: 600,
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
      creator: { 
        id: 4, 
        name: 'Rohit Sharma', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: true 
      },
      rating: 4.6,
      reviewCount: 16,
      category: 'tutoring',
      duration: '1 hour',
      location: 'Library/Online',
      locationType: 'hybrid',
      tags: ['mathematics', 'physics', 'exam prep'],
      description: 'Expert tutoring in mathematics and physics for all levels. Exam preparation available.',
      availability: 'Available evenings',
      responseTime: '< 3 hours',
      completedOrders: 28,
      isTopRated: false
    },
    {
      id: 5,
      title: 'Graphic Design Services',
      priceRange: '₹1000-2500',
      minPrice: 1000,
      maxPrice: 2500,
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
      creator: { 
        id: 5, 
        name: 'Kavya Patel', 
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
        verified: false 
      },
      rating: 4.5,
      reviewCount: 12,
      category: 'design',
      duration: '2-5 days',
      location: 'Online',
      locationType: 'online',
      tags: ['logo design', 'posters', 'branding'],
      description: 'Professional graphic design for logos, posters, social media content, and branding materials.',
      availability: 'Available this month',
      responseTime: '< 6 hours',
      completedOrders: 15,
      isTopRated: false
    },
    {
      id: 6,
      title: 'Spanish Language Lessons',
      priceRange: '₹600-900/hr',
      minPrice: 600,
      maxPrice: 900,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
      creator: { 
        id: 6, 
        name: 'Maria Rodriguez', 
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        verified: true 
      },
      rating: 4.8,
      reviewCount: 25,
      category: 'language',
      duration: '1 hour',
      location: 'Language Lab/Online',
      locationType: 'hybrid',
      tags: ['spanish', 'conversation', 'beginner'],
      description: 'Learn Spanish from a native speaker. Conversational Spanish and grammar lessons available.',
      availability: 'Available Mon-Fri',
      responseTime: '< 2 hours',
      completedOrders: 41,
      isTopRated: true
    }
  ]

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
    console.log('Book service:', service.id)
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
            {sortedServices.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onCreatorClick={handleCreatorClick}
                    onBookService={handleBookService}
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
                    setPriceRange([0, 3000])
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
                    Our team can help match you with the perfect service provider for your needs.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Get Personalized Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services