import React, { useState, useEffect } from 'react'
import { 
  Plus, Upload, Calendar, DollarSign, MessageSquare, Star, Check, Clock, 
  AlertCircle, Eye, User, XCircle, FileText, Mail, Bell, BarChart3, 
  Settings, HelpCircle, Sparkles, Zap, Target, Award, TrendingUp,
  ArrowRight, CheckCircle, Info, Lightbulb, Shield, Users, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import ProposalManager from '../components/ProposalManager'
import OrderTracking from '../components/OrderTracking'
import CustomOrderSidebar from '../components/CustomOrderSidebar'
import SellerCustomOrders from './sellerCustomOrders'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../services/firebase'

const CustomOrder = () => {
  const { currentUser, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('create')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: '',
    attachments: [],
    preferredSeller: '',
    sellerType: 'any', // 'any', 'specific', 'company'
    urgency: 'normal' // 'low', 'normal', 'high', 'urgent'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [myOrders, setMyOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})

  const categories = [
    { id: 'art', name: 'Art & Illustration', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
    { id: 'design', name: 'Graphic Design', icon: '🎨', color: 'bg-blue-100 text-blue-800' },
    { id: 'fashion', name: 'Fashion & Accessories', icon: '👗', color: 'bg-purple-100 text-purple-800' },
    { id: 'tech', name: 'Tech Services', icon: '💻', color: 'bg-green-100 text-green-800' },
    { id: 'writing', name: 'Writing & Content', icon: '✍️', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'tutoring', name: 'Tutoring', icon: '📚', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'photography', name: 'Photography', icon: '📸', color: 'bg-red-100 text-red-800' },
    { id: 'music', name: 'Music & Audio', icon: '🎵', color: 'bg-orange-100 text-orange-800' },
    { id: 'crafts', name: 'Handmade Crafts', icon: '🛠️', color: 'bg-teal-100 text-teal-800' },
    { id: 'other', name: 'Other', icon: '🔧', color: 'bg-gray-100 text-gray-800' }
  ]

  const steps = [
    { id: 1, title: 'Project Details', description: 'Basic information about your project' },
    { id: 2, title: 'Requirements', description: 'Detailed requirements and preferences' },
    { id: 3, title: 'Budget & Timeline', description: 'Budget range and delivery timeline' },
    { id: 4, title: 'Review & Submit', description: 'Review your order and submit' }
  ]

  const validateStep = (step) => {
    const errors = {}
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) errors.title = 'Project title is required'
        if (!formData.category) errors.category = 'Please select a category'
        if (!formData.description.trim()) errors.description = 'Project description is required'
        break
      case 2:
        if (!formData.requirements.trim()) errors.requirements = 'Requirements are required'
        break
      case 3:
        if (!formData.budget.trim()) errors.budget = 'Budget range is required'
        if (!formData.deadline) errors.deadline = 'Deadline is required'
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Fetch user's custom orders
  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'orders'),
      where('type', '==', 'custom'),
      where('buyerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMyOrders(orders)
    })

    return () => unsubscribe()
  }, [currentUser])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('Please log in to create a custom order')
      return
    }

    setSubmitting(true)
    try {
      // Extract budget amount (remove currency symbols and get first number)
      const budgetAmount = parseFloat(formData.budget.replace(/[^\d.-]/g, '')) || 0
      
      // Create custom order
      const orderData = {
        type: 'custom',
        buyerId: currentUser.uid,
        buyerName: userProfile?.displayName || currentUser.email,
        buyerEmail: currentUser.email,
        sellerId: formData.sellerType === 'specific' ? formData.preferredSeller : null,
        sellerName: null,
        itemTitle: formData.title,
        category: formData.category,
        description: formData.description,
        requirements: formData.requirements,
        budget: budgetAmount,
        deadline: formData.deadline,
        urgency: formData.urgency,
        sellerType: formData.sellerType,
        preferredSeller: formData.preferredSeller,
        attachments: formData.attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        totalAmount: budgetAmount,
        quantity: 1,
        status: formData.sellerType === 'specific' ? 'pending_approval' : 'open_for_proposals',
        trackingUpdates: [{
          status: 'created',
          message: 'Custom order created',
          timestamp: new Date(),
          updatedBy: currentUser.uid
        }]
      }

      await orderService.createOrder(orderData)
      
      setSubmitSuccess(true)
      setFormData({
        title: '',
        category: '',
        description: '',
        budget: '',
        deadline: '',
        requirements: '',
        attachments: [],
        preferredSeller: '',
        sellerType: 'any',
        urgency: 'normal'
      })
      setCurrentStep(1)
      setFormErrors({})
      
      // Switch to orders tab after successful submission
      setTimeout(() => {
        setActiveTab('orders')
        setSubmitSuccess(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error creating custom order:', error)
      alert('Failed to create custom order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
      case 'open_for_proposals':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
      case 'open_for_proposals':
        return <AlertCircle size={16} />
      case 'in_progress':
      case 'pending_approval':
        return <Clock size={16} />
      case 'completed':
      case 'approved':
        return <Check size={16} />
      case 'rejected':
        return <AlertCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleProposalAccepted = (proposalId) => {
    // Refresh orders to show updated status
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const renderCreateForm = () => (
    <div className="max-w-5xl mx-auto">
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Order Created Successfully!</h3>
              <p className="text-green-700">Your custom order has been posted and is now visible to sellers.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
          <Sparkles className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Custom Order</h2>
        <p className="text-gray-600 text-lg">Get exactly what you need, made just for you by talented creators</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-transparent text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <Check size={20} />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-gradient-to-r from-purple-500 to-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your project</h3>
                <p className="text-gray-600">Start by giving us the basic details of what you need</p>
              </div>

              <div className="space-y-6">
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Custom logo design for my startup"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors ${
                      formErrors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                    }`}
                    required
                  />
                  {formErrors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleInputChange('category', category.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.category === category.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-700">{category.name}</div>
                      </button>
                    ))}
                  </div>
                  {formErrors.category && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {formErrors.category}
                    </p>
                  )}
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of what you need. The more specific you are, the better proposals you'll receive..."
                    rows={6}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors resize-none ${
                      formErrors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                    }`}
                    required
                  />
                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {formErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Define your requirements</h3>
                <p className="text-gray-600">Help sellers understand exactly what you're looking for</p>
              </div>

              <div className="space-y-6">
                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Specific Requirements *
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List any specific requirements, preferences, or constraints. For example: color schemes, dimensions, file formats, style preferences, etc."
                    rows={8}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors resize-none ${
                      formErrors.requirements ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                    }`}
                    required
                  />
                  {formErrors.requirements && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {formErrors.requirements}
                    </p>
                  )}
                </div>

                {/* Seller Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Seller Preference
                  </label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('sellerType', 'any')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.sellerType === 'any'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Globe className="text-blue-600 mr-2" size={20} />
                          <span className="font-semibold">Open to All</span>
                        </div>
                        <p className="text-sm text-gray-600">Let any qualified seller submit proposals</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange('sellerType', 'company')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.sellerType === 'company'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Shield className="text-green-600 mr-2" size={20} />
                          <span className="font-semibold">Established Companies</span>
                        </div>
                        <p className="text-sm text-gray-600">Prefer verified companies and agencies</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange('sellerType', 'specific')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.sellerType === 'specific'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Target className="text-purple-600 mr-2" size={20} />
                          <span className="font-semibold">Specific Seller</span>
                        </div>
                        <p className="text-sm text-gray-600">Have a particular seller in mind</p>
                      </button>
                    </div>

                    {formData.sellerType === 'specific' && (
                      <div className="mt-4">
                        <input
                          type="text"
                          value={formData.preferredSeller}
                          onChange={(e) => handleInputChange('preferredSeller', e.target.value)}
                          placeholder="Enter seller/company name or email"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-colors"
                        />
                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                          <Info size={16} className="mr-1" />
                          If the seller is not found, your order will be opened to all sellers
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reference Files (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gray-50">
                    <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                    <p className="text-gray-600 mb-2 font-medium">Upload reference files or examples</p>
                    <p className="text-sm text-gray-500 mb-4">Images, documents, or any files that help explain your vision</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload size={16} className="mr-2" />
                      Choose Files
                    </label>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Set budget and timeline</h3>
                <p className="text-gray-600">Help sellers understand your budget and delivery expectations</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Budget Range *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="e.g., ₹5,000 - ₹10,000"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors ${
                          formErrors.budget ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        required
                      />
                    </div>
                    {formErrors.budget && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {formErrors.budget}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <Lightbulb size={16} className="mr-1" />
                      Be realistic about your budget to attract quality proposals
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Deadline *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors ${
                          formErrors.deadline ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        required
                      />
                    </div>
                    {formErrors.deadline && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {formErrors.deadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'low', label: 'Low', desc: 'Flexible timeline', color: 'bg-green-100 text-green-800' },
                      { value: 'normal', label: 'Normal', desc: 'Standard timeline', color: 'bg-blue-100 text-blue-800' },
                      { value: 'high', label: 'High', desc: 'Rush job', color: 'bg-orange-100 text-orange-800' },
                      { value: 'urgent', label: 'Urgent', desc: 'ASAP', color: 'bg-red-100 text-red-800' }
                    ].map(urgency => (
                      <button
                        key={urgency.value}
                        type="button"
                        onClick={() => handleInputChange('urgency', urgency.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.urgency === urgency.value
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">{urgency.label}</div>
                        <div className="text-sm text-gray-600">{urgency.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review your order</h3>
                <p className="text-gray-600">Double-check everything before posting your custom order</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                {/* Project Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Summary</h4>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Title:</span>
                      <p className="text-gray-900 font-medium">{formData.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <p className="text-gray-900">{categories.find(c => c.id === formData.category)?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="text-gray-900">{formData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-900">{formData.requirements}</p>
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Budget & Timeline</h4>
                  <div className="bg-white rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget:</span>
                      <p className="text-gray-900 font-medium">{formData.budget}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Deadline:</span>
                      <p className="text-gray-900">{new Date(formData.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Urgency:</span>
                      <p className="text-gray-900 capitalize">{formData.urgency}</p>
                    </div>
                  </div>
                </div>

                {/* Seller Preference */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Seller Preference</h4>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-900">
                      {formData.sellerType === 'any' && 'Open to any qualified seller'}
                      {formData.sellerType === 'company' && 'Prefer established companies'}
                      {formData.sellerType === 'specific' && `Specific seller: ${formData.preferredSeller || 'Not specified'}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                Next Step
                <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Post Custom Order
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )

  const renderMyOrders = () => (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Custom Orders</h2>
            <p className="text-gray-600 text-lg">Track and manage your custom order requests</p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {myOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{order.itemTitle}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{categories.find(c => c.id === order.category)?.icon}</span>
                  <span className="text-sm font-medium text-gray-600">
                    {categories.find(c => c.id === order.category)?.name || order.category}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Budget</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(order.budget || order.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Deadline</span>
                    <span className="text-sm text-gray-900">{formatDate(order.deadline)}</span>
                  </div>
                  {order.urgency && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Urgency</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                        order.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        order.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.urgency.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {order.description}
                </p>

                {order.sellerName && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Working with {order.sellerName}</p>
                      {order.status === 'completed' && order.rating && (
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-blue-700 ml-1">({order.rating}/5)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Created: {formatDate(order.createdAt)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewOrderDetails(order)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium flex items-center justify-center"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </button>
                  {order.status === 'open_for_proposals' && (
                    <button className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <MessageSquare size={16} />
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <MessageSquare size={16} />
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="text-purple-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No custom orders yet</h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Create your first custom order and connect with talented creators who can bring your vision to life
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center mx-auto shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Create Your First Order
          </button>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return renderCreateForm()
      case 'orders':
        return renderMyOrders()
      case 'browse':
        return <SellerCustomOrders />
      case 'proposals':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Proposals</h2>
              <p className="text-gray-600">Track your submitted proposals for custom orders</p>
            </div>
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
              <p className="text-gray-600">Your submitted proposals will appear here</p>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
              <p className="text-gray-600">Stay updated with your order activities</p>
            </div>
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You'll receive notifications about your orders here</p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600">View your custom order statistics and performance</p>
            </div>
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Detailed analytics will be available soon</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Customize your custom order preferences</p>
            </div>
            <div className="text-center py-12">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
              <p className="text-gray-600">Customization options will be available soon</p>
            </div>
          </div>
        )
      case 'help':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
              <p className="text-gray-600">Get help with custom orders and marketplace features</p>
            </div>
            <div className="text-center py-12">
              <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Help Center</h3>
              <p className="text-gray-600">Documentation and support resources coming soon</p>
            </div>
          </div>
        )
      default:
        return renderCreateForm()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <CustomOrderSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Custom Orders
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">Get exactly what you need, made just for you by talented creators</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{myOrders.length}</div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedOrder.itemTitle}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {categories.find(c => c.id === selectedOrder.category)?.name || selectedOrder.category}
                    </span>
                    <span>Budget: {formatCurrency(selectedOrder.budget || selectedOrder.totalAmount)}</span>
                    <span>Deadline: {formatDate(selectedOrder.deadline)}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedOrder.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedOrder.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedOrder.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.urgency?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {selectedOrder.description}
                        </p>
                      </div>

                      {selectedOrder.requirements && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {selectedOrder.requirements}
                          </p>
                        </div>
                      )}

                      {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                          <div className="space-y-2">
                            {selectedOrder.attachments.map((file, index) => (
                              <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                <FileText size={16} className="mr-2" />
                                <span>{file.name}</span>
                                <span className="ml-auto text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Tracking */}
                  <OrderTracking 
                    orderId={selectedOrder.id} 
                    orderData={selectedOrder}
                    onUpdate={(status) => {
                      // Update local order data
                      setSelectedOrder(prev => ({ ...prev, status }))
                    }}
                  />
                </div>

                {/* Proposals and Seller Info */}
                <div className="space-y-6">
                  {selectedOrder.sellerName && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">Assigned Seller</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          <span>{selectedOrder.sellerName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2" />
                          <span>{selectedOrder.sellerEmail || 'Email not provided'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Proposals Manager */}
                  <ProposalManager 
                    orderId={selectedOrder.id}
                    orderData={selectedOrder}
                    onProposalAccepted={handleProposalAccepted}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomOrder