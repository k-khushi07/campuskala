import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Star, MessageCircle, ExternalLink, Search, Filter, Grid3X3, List, MapPin, Award, TrendingUp } from 'lucide-react'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '../services/firebase'
import CustomOrderModalSimple from '../components/CustomOrderModalSimple'

const FeaturedCreators = () => {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState(null)

  // Fetch all featured creators
  useEffect(() => {
    setLoading(true)
    
    const q = query(
      collection(db, 'featured_creators'),
      where('status', '==', 'approved'),
      limit(50) // Show more creators on dedicated page
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const creatorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Sort by createdAt in descending order (newest first)
        const sortedCreators = creatorsList.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0)
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0)
          return bTime - aTime
        })
        
        setCreators(sortedCreators)
      } catch (error) {
        console.error('Error fetching featured creators:', error)
      } finally {
        setLoading(false)
      }
    }, (error) => {
      console.error('Error listening to featured creators:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const specialties = [
    'all', 'Digital Art & Illustration', 'Fashion Design', 'Handmade Crafts', 
    'Photography', 'Music & Audio', 'Tech & Programming', 'Writing & Content',
    'Graphic Design', 'Interior Design', 'Culinary Arts', 'Other'
  ]

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === 'all' || creator.specialty === selectedSpecialty
    
    return matchesSearch && matchesSpecialty
  })

  const handleCreatorClick = (creator) => {
    setSelectedCreator(creator)
    setShowCustomOrderModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Featured Creators</h1>
                <p className="text-gray-600 mt-1">Discover talented creators ready for custom orders</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Creators
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, specialty, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-gray-50 rounded-lg p-4 w-full">
                <div className="text-sm text-gray-600">Showing</div>
                <div className="text-2xl font-bold text-gray-900">{filteredCreators.length}</div>
                <div className="text-sm text-gray-600">featured creators</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredCreators.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Creators Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedSpecialty !== 'all' 
                ? 'Try adjusting your search or filters to find more creators.'
                : 'No featured creators available at the moment.'
              }
            </p>
            {searchQuery || selectedSpecialty !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSpecialty('all')
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/sell"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Become a Featured Creator
              </Link>
            )}
          </div>
        ) : (
          /* Creators Grid/List */
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
          }>
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 ${
                  viewMode === 'list' ? 'p-6' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  /* Grid View */
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          src={creator.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          creator.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                        <p className="text-sm text-gray-600">{creator.specialty}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="text-yellow-400" size={14} fill="currentColor" />
                          <span className="text-sm font-medium text-gray-900">{creator.rating || 5.0}</span>
                          <span className="text-xs text-gray-500">({creator.orders || 0} orders)</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {creator.bio || 'No bio available'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        creator.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {creator.isAvailable ? 'Available' : 'Busy'}
                      </span>
                      {creator.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin size={12} className="mr-1" />
                          {creator.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCreatorClick(creator)}
                        disabled={!creator.isAvailable}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          creator.isAvailable
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <MessageCircle size={16} className="inline mr-1" />
                        {creator.isAvailable ? 'Contact' : 'Busy'}
                      </button>
                      {creator.portfolio && (
                        <a
                          href={creator.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center py-2 px-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={creator.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                        alt={creator.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        creator.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{creator.name}</h3>
                          <p className="text-gray-600">{creator.specialty}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-400" size={16} fill="currentColor" />
                            <span className="font-medium text-gray-900">{creator.rating || 5.0}</span>
                            <span className="text-sm text-gray-500">({creator.orders || 0} orders)</span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            creator.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {creator.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {creator.bio || 'No bio available'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {creator.location && (
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {creator.location}
                            </div>
                          )}
                          {creator.experience && (
                            <div className="flex items-center">
                              <Award size={14} className="mr-1" />
                              {creator.experience}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCreatorClick(creator)}
                            disabled={!creator.isAvailable}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              creator.isAvailable
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <MessageCircle size={16} className="inline mr-1" />
                            {creator.isAvailable ? 'Contact' : 'Busy'}
                          </button>
                          {creator.portfolio && (
                            <a
                              href={creator.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              <ExternalLink size={16} className="mr-1" />
                              Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Order Modal */}
      {selectedCreator && (
        <CustomOrderModalSimple
          isOpen={showCustomOrderModal}
          onClose={() => {
            setShowCustomOrderModal(false)
            setSelectedCreator(null)
          }}
          creator={selectedCreator}
        />
      )}
    </div>
  )
}

export default FeaturedCreators
