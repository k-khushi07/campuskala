import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ChevronRight, Palette, Shirt, Camera, Music, Code, BookOpen, Star, MessageCircle, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ServiceCard from '../components/ServiceCard'
import CustomOrderModalSimple from '../components/CustomOrderModalSimple'
import { useRealtimeProducts, useRealtimeServices } from '../hooks/useRealtime'
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

const Home = () => {
  const [activeTab, setActiveTab] = useState('products')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [featuredCreators, setFeaturedCreators] = useState([])
  const [loadingCreators, setLoadingCreators] = useState(true)
  const [newCreatorNotification, setNewCreatorNotification] = useState(null)

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

  // Real-time listener for featured creators from Firebase
  useEffect(() => {
    setLoadingCreators(true)
    
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'featured_creators'),
      where('status', '==', 'approved'),
      limit(6) // Increased limit to show more creators
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        console.log('Featured creators query snapshot:', querySnapshot.docs.length, 'docs')
        
        const creators = querySnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('Creator data:', doc.id, data)
          return {
            id: doc.id,
            ...data
          }
        })
        
        // Sort by createdAt in descending order (newest first)
        const sortedCreators = creators.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0)
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0)
          return bTime - aTime
        })
        
        console.log('Processed and sorted creators:', sortedCreators)
        
        // Check if this is a new creator (more creators than before)
        const previousCount = featuredCreators.length
        if (creators.length > previousCount && previousCount > 0) {
          // New creator added - show notification
          const newCreator = creators[0] // Most recent creator
          setNewCreatorNotification({
            message: `🎉 Welcome ${newCreator.name} as a new featured creator!`,
            creator: newCreator
          })
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setNewCreatorNotification(null)
          }, 5000)
        }
        
        // If we have creators from Firebase, use them
        if (sortedCreators.length > 0) {
          console.log('Setting featured creators from Firebase:', sortedCreators)
          setFeaturedCreators(sortedCreators)
        } else {
          // Fallback to sample data if no creators in database
          setFeaturedCreators([
            {
              id: 'sample-1',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
      specialty: 'Digital Art & Illustration',
      rating: 4.9,
              orders: 156,
              whatsapp: '919876543210',
              portfolio: 'https://instagram.com/priyasharma_art',
              isAvailable: true
    },
    {
              id: 'sample-2',
      name: 'Raj Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      specialty: 'Fashion Design',
      rating: 4.8,
              orders: 98,
              whatsapp: '919876543211',
              portfolio: 'https://instagram.com/rajpatel_fashion',
              isAvailable: true
            }
          ])
        }
      } catch (error) {
        console.error('Error processing featured creators:', error)
        // Keep existing creators on error
      } finally {
        setLoadingCreators(false)
      }
    }, (error) => {
      console.error('Error listening to featured creators:', error)
      setLoadingCreators(false)
      
      // Try a simpler query without orderBy
      console.log('Trying fallback query...')
      const fallbackQ = query(
        collection(db, 'featured_creators'),
        where('status', '==', 'approved'),
        limit(6)
      )
      
      onSnapshot(fallbackQ, (fallbackSnapshot) => {
        console.log('Fallback query result:', fallbackSnapshot.docs.length, 'docs')
        const fallbackCreators = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        if (fallbackCreators.length > 0) {
          setFeaturedCreators(fallbackCreators)
        } else {
          // Final fallback to sample data
          setFeaturedCreators([
            {
              id: 'sample-1',
              name: 'Priya Sharma',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
              specialty: 'Digital Art & Illustration',
              rating: 4.9,
              orders: 156,
              whatsapp: '919876543210',
              portfolio: 'https://instagram.com/priyasharma_art',
              isAvailable: true
            },
            {
              id: 'sample-2',
              name: 'Raj Patel',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
              specialty: 'Fashion Design',
              rating: 4.8,
              orders: 98,
              whatsapp: '919876543211',
              portfolio: 'https://instagram.com/rajpatel_fashion',
              isAvailable: true
            }
          ])
        }
      }, (fallbackError) => {
        console.error('Fallback query also failed:', fallbackError)
        // Final fallback to sample data
        setFeaturedCreators([
          {
            id: 'sample-1',
            name: 'Priya Sharma',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
            specialty: 'Digital Art & Illustration',
      rating: 4.9,
            orders: 156,
            whatsapp: '919876543210',
            portfolio: 'https://instagram.com/priyasharma_art',
            isAvailable: true
          },
          {
            id: 'sample-2',
            name: 'Raj Patel',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            specialty: 'Fashion Design',
            rating: 4.8,
            orders: 98,
            whatsapp: '919876543211',
            portfolio: 'https://instagram.com/rajpatel_fashion',
            isAvailable: true
          }
        ])
      })
    })

    // Cleanup listener on component unmount
    return () => unsubscribe()
  }, [])

  const handleCreatorClick = (creator) => {
    setSelectedCreator(creator)
    setShowCustomOrderModal(true)
  }

  const handleViewAll = () => {
    if (activeTab === 'products') {
      navigate('/products')
    } else if (activeTab === 'services') {
      navigate('/services')
    } else {
      // For featured creators section
      navigate('/featured-creators')
    }
  }

  // Debug function to manually check Firebase data
  const debugFirebaseData = async () => {
    try {
      console.log('=== DEBUGGING FIREBASE DATA ===')
      
      // Get all documents in featured_creators collection
      const allDocs = await getDocs(collection(db, 'featured_creators'))
      console.log('Total documents in featured_creators:', allDocs.docs.length)
      
      allDocs.docs.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`, doc.id, doc.data())
      })
      
      // Test the exact query we're using
      const testQuery = query(
        collection(db, 'featured_creators'),
        where('status', '==', 'approved'),
        limit(6)
      )
      
      const testSnapshot = await getDocs(testQuery)
      console.log('Query result:', testSnapshot.docs.length, 'docs')
      testSnapshot.docs.forEach((doc, index) => {
        console.log(`Query result ${index + 1}:`, doc.id, doc.data())
      })
      
    } catch (error) {
      console.error('Debug error:', error)
    }
  }

  const handleBecomeCreator = () => {
    navigate('/sell')
  }

  const handleLearnMore = () => {
    navigate('/services')
  }

  const handleBookingClick = (service) => {
    console.log('Booking service:', service?.id)
    // For services, you can implement a similar modal or direct contact system
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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Creator Notification */}
      {newCreatorNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl shadow-lg max-w-sm animate-slide-in">
          <div className="flex items-center space-x-3">
            <Star className="text-yellow-300" size={24} />
            <div className="flex-1">
              <p className="font-semibold">{newCreatorNotification.message}</p>
              <p className="text-sm opacity-90">Check them out in the featured creators section!</p>
            </div>
            <button
              onClick={() => setNewCreatorNotification(null)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

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
            {['products', 'services'].map((tab) => (
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
            <div className="flex items-center space-x-4">
              <button 
                onClick={debugFirebaseData} 
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Debug Firebase
              </button>
              <button onClick={() => navigate('/featured-creators')} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                View All <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {loadingCreators ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 w-72 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : featuredCreators.length === 0 ? (
                <div className="flex-shrink-0 bg-white rounded-lg shadow-md p-8 w-full text-center">
                  <Star className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Creators Yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to become a featured creator!</p>
                  <button
                    onClick={() => navigate('/sell')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                featuredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 w-72"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        creator.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                      <p className="text-sm text-gray-600">{creator.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          creator.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {creator.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400" size={16} fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900">{creator.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{creator.orders} orders</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCreatorClick(creator)}
                      disabled={!creator.isAvailable}
                      className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        creator.isAvailable
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      {creator.isAvailable ? 'Request Custom Order' : 'Currently Busy'}
                    </button>
                    <a
                      href={creator.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center py-2 px-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Portfolio
                    </a>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
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

export default Home