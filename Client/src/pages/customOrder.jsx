import React, { useState } from 'react'
import { Plus, Upload, Calendar, DollarSign, MessageSquare, Star, Check, Clock, AlertCircle } from 'lucide-react'

const CustomOrder = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: '',
    attachments: []
  })

  const categories = [
    { id: 'art', name: 'Art & Illustration' },
    { id: 'design', name: 'Graphic Design' },
    { id: 'fashion', name: 'Fashion & Accessories' },
    { id: 'tech', name: 'Tech Services' },
    { id: 'writing', name: 'Writing & Content' },
    { id: 'tutoring', name: 'Tutoring' },
    { id: 'photography', name: 'Photography' },
    { id: 'music', name: 'Music & Audio' },
    { id: 'crafts', name: 'Handmade Crafts' },
    { id: 'other', name: 'Other' }
  ]

  const myOrders = [
    {
      id: 1,
      title: 'Custom Logo Design for Startup',
      category: 'Graphic Design',
      budget: '₹2500',
      status: 'in_progress',
      creator: {
        id: 1,
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100'
      },
      createdAt: '2024-02-15',
      deadline: '2024-02-25',
      progress: 60,
      lastUpdate: '2 hours ago',
      proposals: 8
    },
    {
      id: 2,
      title: 'Custom Wedding Invitation Design',
      category: 'Design',
      budget: '₹1800',
      status: 'completed',
      creator: {
        id: 2,
        name: 'Raj Patel',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      },
      createdAt: '2024-02-10',
      deadline: '2024-02-20',
      progress: 100,
      lastUpdate: '1 day ago',
      proposals: 12,
      rating: 5
    },
    {
      id: 3,
      title: 'Math Tutoring for Semester Exam',
      category: 'Tutoring',
      budget: '₹3000',
      status: 'open',
      creator: null,
      createdAt: '2024-02-20',
      deadline: '2024-03-15',
      progress: 0,
      lastUpdate: '1 hour ago',
      proposals: 5
    }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...Array.from(files)]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Submitting custom order:', formData)
    // Handle form submission
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />
      case 'in_progress':
        return <Clock size={16} />
      case 'completed':
        return <Check size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const renderCreateForm = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Custom Order</h2>
          <p className="text-gray-600">Describe what you need and let talented creators bid on your project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Custom logo design for my startup"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of what you need..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Budget and Deadline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., ₹1000-2000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Any specific requirements, preferences, or constraints..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Post Custom Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderMyOrders = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Custom Orders</h2>
        <p className="text-gray-600">Track and manage your custom order requests</p>
      </div>

      <div className="space-y-6">
        {myOrders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">{order.category}</span>
                    <span>{order.budget}</span>
                    <span>Deadline: {new Date(order.deadline).toLocaleDateString()}</span>
                    <span>{order.proposals} proposals</span>
                  </div>

                  {order.creator && (
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={order.creator.avatar}
                        alt={order.creator.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Working with {order.creator.name}
                      </span>
                      {order.status === 'completed' && order.rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Last updated: {order.lastUpdate}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {order.status === 'open' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                      View Proposals ({order.proposals})
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                        <MessageSquare size={16} className="inline mr-1" />
                        Message
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        View Progress
                      </button>
                    </>
                  )}
                  {order.status === 'completed' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                      Download Files
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {myOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <MessageSquare className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom orders yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first custom order to get started
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Create Custom Order
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Orders</h1>
              <p className="text-gray-600 mt-1">Get exactly what you need, made just for you</p>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus size={16} className="inline mr-1" />
                Create Order
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? renderCreateForm() : renderMyOrders()}
      </div>
    </div>
  )
}

export default CustomOrder