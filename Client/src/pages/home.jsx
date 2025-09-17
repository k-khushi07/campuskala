import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ChevronRight, Palette, Shirt, Camera, Music, Code, BookOpen, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ServiceCard from '../components/ServiceCard'
import { useRealtimeProducts, useRealtimeServices } from '../hooks/useRealtime'

const Home = () => {
  const [activeTab, setActiveTab] = useState('products')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: <Filter size={16} /> },
    { id: 'art', name: 'Art', icon: <Palette size={16} /> },
    { id: 'fashion', name: 'Fashion', icon: <Shirt size={16} /> },
    { id: 'photography', name: 'Photography', icon: <Camera size={16} /> },
    { id: 'music', name: 'Music', icon: <Music size={16} /> },
    { id: 'tech', name: 'Tech', icon: <Code size={16} /> },
    { id: 'education', name: 'Education', icon: <BookOpen size={16} /> },
  ]

  // Live data
  const { products: sampleProducts } = useRealtimeProducts({ sortBy: 'popular', limit: 24 })

  const { services: sampleServices } = useRealtimeServices({ limit: 24 })

  const featuredCreators = [
    {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
      specialty: 'Digital Art & Illustration',
      rating: 4.9,
      orders: 156
    },
    {
      id: 2,
      name: 'Raj Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      specialty: 'Fashion Design',
      rating: 4.8,
      orders: 98
    },
    {
      id: 3,
      name: 'Anita Kumar',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      specialty: 'Handmade Crafts',
      rating: 4.9,
      orders: 203
    },
    {
      id: 4,
      name: 'Aditi Mehta',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      specialty: 'Photography',
      rating: 4.9,
      orders: 87
    }
  ]

  const handleCreatorClick = (creator) => {
    console.log('Navigate to creator:', creator.id)
  }

  const handleViewAll = () => {
    navigate(activeTab === 'products' ? '/products' : '/services')
  }

  const handleBecomeCreator = () => {
    navigate('/sell')
  }

  const handleLearnMore = () => {
    navigate('/services')
  }

  const handleBookingClick = (service) => {
    console.log('Booking service:', service?.id)
    navigate('/custom-order')
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredData = useMemo(() => {
    const data = activeTab === 'products' ? sampleProducts : 
                  activeTab === 'services' ? sampleServices : []
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || 
                             item.category.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [activeTab, sampleProducts, sampleServices, searchQuery, selectedCategory])

  const renderCustomOrdersContent = () => (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Palette className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Need Something Custom?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Can't find what you're looking for? Our talented creators can make it just for you! 
          From personalized artwork to custom services, we've got you covered.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Palette className="text-blue-600 mb-4 mx-auto" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Custom Artwork</h3>
            <p className="text-sm text-gray-600">Personalized paintings, digital art, and illustrations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shirt className="text-green-600 mb-4 mx-auto" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Custom Fashion</h3>
            <p className="text-sm text-gray-600">Tailored clothing, jewelry, and accessories</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Code className="text-purple-600 mb-4 mx-auto" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Custom Services</h3>
            <p className="text-sm text-gray-600">Personalized tutoring, consulting, and more</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-200">
          Request Custom Order
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Campus
            <span className="text-yellow-300"> Creativity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with talented student creators for unique products, services, and custom orders
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products, services, or creators..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="sticky top-16 bg-white z-40 py-4 border-b border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
            {['products', 'services', 'custom'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'custom' && ' Orders'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        {(activeTab === 'products' || activeTab === 'services') && (
          <div className="py-6">
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Creators Section */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Creators</h2>
            <button onClick={handleViewAll} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              View All <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {featuredCreators.map((creator) => (
                <div
                  key={creator.id}
                  onClick={() => handleCreatorClick(creator)}
                  className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 w-64"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                      <p className="text-sm text-gray-600">{creator.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400" size={16} fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900">{creator.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{creator.orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        {activeTab === 'custom' ? (
          renderCustomOrdersContent()
        ) : (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'products' ? 'Browse All Products' : 'Browse All Services'}
                {selectedCategory !== 'all' && (
                  <span className="text-blue-600 ml-2">
                    • {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-500">
                {filteredData.length} {activeTab} found
              </div>
            </div>

            {/* Products/Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.map((item) => (
                activeTab === 'products' ? (
                  <ProductCard 
                    key={item.id} 
                    product={item} 
                    onCreatorClick={handleCreatorClick}
                  />
                ) : (
                  <ServiceCard 
                    key={item.id} 
                    service={item} 
                    onCreatorClick={handleCreatorClick}
                    onBookingClick={handleBookingClick}
                  />
                )
              ))}
            </div>

            {/* No Results */}
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or category filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl my-12">
          <div className="text-center max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Creating?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our community of talented creators and start showcasing your skills to fellow students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleBecomeCreator} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors">
                Become a Creator
              </button>
              <button onClick={handleLearnMore} className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home