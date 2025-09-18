import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Camera, 
  Star, 
  ShoppingBag, 
  Heart, 
  Award, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Settings,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Plus,
  Upload,
  AlertCircle,
  GraduationCap,
  Building
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useRealtimeOrders } from '../hooks/useRealtime'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

const Profile = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, updateUserProfile } = useAuth()
  const { count: cartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { orders } = useRealtimeOrders(currentUser?.uid, 'buyer')
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  
  // Use real user data with fallbacks
  const [profileData, setProfileData] = useState({
    name: userProfile?.displayName || currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    college: userProfile?.college || '',
    department: userProfile?.department || '',
    year: userProfile?.year || '',
    bio: userProfile?.bio || '',
    joinedDate: currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    avatar: userProfile?.avatar || currentUser?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    coverImage: userProfile?.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
  })

  // Calculate real stats from user data
  const stats = {
    totalOrders: orders?.length || 0,
    totalSpent: orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
    wishlistItems: wishlistItems?.length || 0,
    reviewsGiven: 0, // TODO: Implement reviews system
    averageRating: 4.6 // TODO: Calculate from actual reviews
  }

  // Check profile completion
  useEffect(() => {
    if (currentUser && userProfile) {
      const requiredFields = ['displayName', 'phone', 'location', 'college', 'department']
      const missingFields = requiredFields.filter(field => !userProfile[field])
      
      if (missingFields.length > 0) {
        setShowProfileCompletion(true)
      }
    }
  }, [currentUser, userProfile])


  const handleSave = async () => {
    if (!currentUser) return
    
    try {
      setIsUploading(true)
      
      // Update user profile in Firebase
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        displayName: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        college: profileData.college,
        department: profileData.department,
        year: profileData.year,
        bio: profileData.bio,
        avatar: profileData.avatar,
        coverImage: profileData.coverImage,
        updatedAt: serverTimestamp()
      })

      // Also update Firebase Auth profile photo if avatar changed
      if (profileData.avatar && profileData.avatar !== currentUser.photoURL) {
        try {
          await updateProfile(currentUser, {
            photoURL: profileData.avatar
          })
        } catch (error) {
          console.error('Error updating auth profile photo:', error)
          // Don't fail the entire save if photo update fails
        }
      }
      
      // Update local auth context
      await updateUserProfile({
        displayName: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        college: profileData.college,
        department: profileData.department,
        year: profileData.year,
        bio: profileData.bio,
        avatar: profileData.avatar,
        coverImage: profileData.coverImage
      })
      
      setIsEditing(false)
      setShowProfileCompletion(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      setIsUploading(true)
      setImageUploadProgress(0)

      // For now, we'll use a simple base64 conversion
      // In production, you'd upload to Firebase Storage or another service
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }))
        setIsUploading(false)
        setImageUploadProgress(100)
      }
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setImageUploadProgress(progress)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setIsUploading(false)
      setImageUploadProgress(0)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'in_transit':
        return 'text-blue-600 bg-blue-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} />
      case 'in_transit':
        return <Package size={16} />
      case 'processing':
        return <Clock size={16} />
      default:
        return <Package size={16} />
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Profile Completion Alert */}
      {showProfileCompletion && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200/50 rounded-2xl p-6 shadow-lg shadow-amber-500/10">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-xl mb-2">Complete Your Profile</h3>
              <p className="text-gray-700 mb-4">
                Add your photo, phone number, location, college details, and bio to unlock all features and connect better with the CampusKala community!
              </p>
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Complete Profile Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center group transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <ShoppingBag className="text-white" size={28} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalOrders}</div>
          <div className="text-sm font-medium text-gray-600">Total Orders</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-2xl border border-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-center group transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <TrendingUp className="text-white" size={28} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">₹{stats.totalSpent.toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-600">Total Spent</div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-6 rounded-2xl border border-pink-200/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 text-center group transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Heart className="text-white" size={28} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.wishlistItems}</div>
          <div className="text-sm font-medium text-gray-600">Wishlist Items</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border border-amber-200/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 text-center group transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Star className="text-white" size={28} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.reviewsGiven}</div>
          <div className="text-sm font-medium text-gray-600">Reviews Given</div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-6 rounded-2xl border border-violet-200/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 text-center group transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Award className="text-white" size={28} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.averageRating}</div>
          <div className="text-sm font-medium text-gray-600">Avg. Rating</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/my-orders')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Orders
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {orders && orders.length > 0 ? (
            orders.slice(0, 3).map(order => (
            <div key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">#{order.id.slice(-8)}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                    <img
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/48x48'}
                          alt={item.title || item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                          <div className="font-medium text-gray-900 text-sm">{item.title || item.name}</div>
                          <div className="text-sm text-gray-600">by {order.sellerName}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{order.itemTitle || 'Order Item'}</div>
                        <div className="text-sm text-gray-600">by {order.sellerName}</div>
                      </div>
                    </div>
                  )}
                  <div className="ml-auto text-right">
                    <div className="font-semibold text-gray-900">₹{(order.totalAmount || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No orders yet</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            <p className="text-gray-600 mt-1">Track all your orders and their status</p>
          </div>
          <button
            onClick={() => navigate('/my-orders')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
          >
            View All Orders
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {orders && orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-bold text-gray-900 text-lg">#{order.id.slice(-8)}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={item.image || item.images?.[0] || 'https://via.placeholder.com/64x64'}
                            alt={item.title || item.name}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{item.title || item.name}</div>
                            <div className="text-sm text-gray-600">by {order.sellerName}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{order.itemTitle || 'Order Item'}</div>
                          <div className="text-sm text-gray-600">by {order.sellerName}</div>
                        </div>
                      </div>
                    )}
                    {order.items && order.items.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-xl">₹{(order.totalAmount || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{order.items?.length || 1} item(s)</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => navigate('/my-orders')}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200">
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderWishlist = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-gray-600 mt-1">{wishlistItems?.length || 0} items saved</p>
          </div>
          <button
            onClick={() => navigate('/wishlist')}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-md"
          >
            View All
          </button>
        </div>
      </div>
      <div className="p-6">
        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.slice(0, 6).map(item => (
              <div key={item.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <img
                    src={item.image || item.images?.[0] || 'https://via.placeholder.com/300x200'}
                    alt={item.title || item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart size={16} className="text-red-500" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title || item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {item.creator || 'Creator'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{(item.price || 0).toLocaleString()}
                    </span>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist for later</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 size={16} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <div className="p-6">
          {/* Profile Photo Upload */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">Profile Photo</label>
            <div className="flex items-start space-x-6">
              <div className="relative group">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <Camera size={24} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                      <div className="text-xs">{imageUploadProgress.toFixed(0)}%</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Computer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Or</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={profileData.avatar}
                        onChange={(e) => handleInputChange('avatar', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Supports JPG, PNG, GIF up to 5MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Your current profile photo</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Change Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Full Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{profileData.name || 'Not set'}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@example.com"
                  disabled
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{profileData.email}</p>
                </div>
              )}
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Phone Number <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+91 9876543210"
                  required
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{profileData.phone || 'Not set'}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                  required
                />
              ) : (
                <p className="text-gray-900">{profileData.location || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College/University *</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your college name"
                  required
                />
              ) : (
                <p className="text-gray-900">{profileData.college || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department/Stream *</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science Engineering"
                  required
                />
              ) : (
                <p className="text-gray-900">{profileData.department || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              {isEditing ? (
                <select
                  value={profileData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Research Scholar">Research Scholar</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.year || 'Not set'}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profileData.bio}</p>
            )}
          </div>
          
          {isEditing && (
            <div className="mt-6">
              {/* Profile Completion Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Complete Your Profile</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Fill in all required fields (*) to complete your profile. This helps other users connect with you and improves your experience on CampusKala.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
              </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <button 
            onClick={() => navigate('/my-orders')}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">View All Orders</div>
              <div className="text-sm text-gray-600">Track your order history</div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/wishlist')}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-pink-300 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">My Wishlist</div>
              <div className="text-sm text-gray-600">View saved items</div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/sell')}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Start Selling</div>
              <div className="text-sm text-gray-600">List your products</div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/featured-creators')}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-violet-300 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Featured Creators</div>
              <div className="text-sm text-gray-600">Discover creators</div>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="p-6 border-b border-red-200">
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-red-900">Delete Account</div>
              <div className="text-sm text-red-600">Permanently delete your account and all data</div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Sync tab with URL (?tab=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['overview', 'orders', 'wishlist', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [location.search])

  // Keep URL updated when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab)
      navigate({ pathname: '/profile', search: params.toString() }, { replace: true })
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Profile Info */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative group">
                <div className="relative">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white/30 object-cover shadow-2xl"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer">
                        <Camera size={24} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                        <div className="text-xs">{imageUploadProgress.toFixed(0)}%</div>
                      </div>
                    </div>
                  )}
                </div>
                {showProfileCompletion && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={12} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-center lg:text-left">
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
                  {profileData.name || 'Complete Your Profile'}
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 text-white/90">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Mail size={16} />
                    <span className="text-sm lg:text-base">{profileData.email || 'No email'}</span>
                  </div>
                  {profileData.location && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <MapPin size={16} />
                      <span className="text-sm lg:text-base">{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Calendar size={16} />
                    <span className="text-sm lg:text-base">
                      Joined {profileData.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
                {profileData.department && profileData.year && profileData.college ? (
                  <div className="mt-2 text-white/80 text-sm lg:text-base">
                    <GraduationCap size={16} className="inline mr-1" />
                    {profileData.department} • {profileData.year} • {profileData.college}
                  </div>
                ) : (
                  <div className="mt-2 text-white/60 text-sm lg:text-base">
                    <Building size={16} className="inline mr-1" />
                    Complete your academic information
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
              <button 
                onClick={() => setActiveTab('settings')} 
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Settings size={18} />
                <span className="font-medium">Settings</span>
              </button>
              {showProfileCompletion && (
                <button 
                  onClick={() => setActiveTab('settings')} 
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-lg"
                >
                  <Plus size={18} />
                  <span className="font-medium">Complete Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 overflow-x-auto py-3">
            {[
              { id: 'overview', name: 'Overview', icon: User, count: stats.totalOrders, color: 'from-emerald-500 to-teal-600' },
              { id: 'orders', name: 'Orders', icon: ShoppingBag, count: stats.totalOrders, color: 'from-blue-500 to-indigo-600' },
              { id: 'wishlist', name: 'Wishlist', icon: Heart, count: stats.wishlistItems, color: 'from-pink-500 to-rose-600' },
              { id: 'settings', name: 'Settings', icon: Settings, color: 'from-violet-500 to-purple-600' }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.color.split('-')[1]}-500/25`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isActive 
                        ? 'bg-white/25 text-white backdrop-blur-sm' 
                        : 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'wishlist' && renderWishlist()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  )
}

export default Profile