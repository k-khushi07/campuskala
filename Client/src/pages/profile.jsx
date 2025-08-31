import React, { useState } from 'react'
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
  LogOut
} from 'lucide-react'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Arjun Kumar',
    email: 'arjun.kumar@college.edu',
    phone: '+91 9876543210',
    location: 'Bengaluru, Karnataka',
    college: 'Indian Institute of Technology',
    department: 'Computer Science Engineering',
    year: '3rd Year',
    bio: 'Passionate about technology and creative arts. Love creating digital solutions and exploring new design trends.',
    joinedDate: '2023-08-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
  })

  const stats = {
    totalOrders: 24,
    totalSpent: 8750,
    wishlistItems: 12,
    reviewsGiven: 18,
    averageRating: 4.6
  }

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-02-20',
      status: 'delivered',
      total: 1200,
      items: [
        {
          id: 1,
          title: 'Hand-painted Canvas Art',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
          creator: 'Priya Sharma'
        }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-02-18',
      status: 'in_transit',
      total: 800,
      items: [
        {
          id: 2,
          title: 'Handmade Jewelry Set',
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100',
          creator: 'Anita Kumar'
        }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-02-15',
      status: 'processing',
      total: 350,
      items: [
        {
          id: 3,
          title: 'Ceramic Coffee Mug',
          image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=100',
          creator: 'Sonal Dave'
        }
      ]
    }
  ]

  const wishlistItems = [
    {
      id: 1,
      title: 'Digital Portrait Art',
      price: 600,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100',
      creator: 'Vikash Singh'
    },
    {
      id: 2,
      title: 'Custom T-shirt Design',
      price: 450,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      creator: 'Raj Patel'
    },
    {
      id: 3,
      title: 'Laptop Stickers Pack',
      price: 200,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      creator: 'Karan Joshi'
    }
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Handle save profile data
    console.log('Saving profile data:', profileData)
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <ShoppingBag className="mx-auto text-blue-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Heart className="mx-auto text-red-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</div>
          <div className="text-sm text-gray-600">Wishlist Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Star className="mx-auto text-yellow-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.reviewsGiven}</div>
          <div className="text-sm text-gray-600">Reviews Given</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Award className="mx-auto text-purple-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
          <div className="text-sm text-gray-600">Avg. Rating</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Orders
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.map(order => (
            <div key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{order.id}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-sm text-gray-600">by {item.creator}</div>
                    </div>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <div className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {recentOrders.map(order => (
          <div key={order.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-gray-900">{order.id}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600">by {item.creator}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-lg">₹{order.total.toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWishlist = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
        <p className="text-gray-600 mt-1">{wishlistItems.length} items saved</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {wishlistItems.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {item.creator}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{item.price.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <Heart size={18} fill="currentColor" />
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.location}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.college}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.department}</p>
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
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-gray-400" size={20} />
                <div>
                  <div className="font-medium text-gray-900">Notifications</div>
                  <div className="text-sm text-gray-600">Manage your notification preferences</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Configure
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-gray-400" size={20} />
                <div>
                  <div className="font-medium text-gray-900">Privacy & Security</div>
                  <div className="text-sm text-gray-600">Control who can see your information</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Manage
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-gray-400" size={20} />
                <div>
                  <div className="font-medium text-gray-900">Payment Methods</div>
                  <div className="text-sm text-gray-600">Manage your saved payment methods</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Manage
              </button>
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image & Avatar */}
      <div className="relative">
        <div
          className="h-48 lg:h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${profileData.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 lg:-mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                  <Camera size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="text-center lg:text-left pb-6">
                <h1 className="text-3xl font-bold text-white lg:text-gray-900">
                  {profileData.name}
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-2 text-white lg:text-gray-600">
                  <div className="flex items-center justify-center lg:justify-start gap-1">
                    <Mail size={16} />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-1">
                    <MapPin size={16} />
                    <span>{profileData.location}</span>
                  </div>
                </div>
                <div className="mt-2 text-white lg:text-gray-600">
                  <span>{profileData.department} • {profileData.year} • {profileData.college}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end pb-6">
              <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Settings size={16} />
                Account Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: User },
              { id: 'orders', name: 'Orders', icon: ShoppingBag },
              { id: 'wishlist', name: 'Wishlist', icon: Heart },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
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