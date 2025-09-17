import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  User, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore'
import { db } from '../services/firebase'
import orderService from '../services/orderService'
import notificationService from '../services/notificationService'

const SellerCustomOrders = () => {
  const { currentUser, userProfile } = useAuth()
  const [customOrders, setCustomOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [proposal, setProposal] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [proposedTimeline, setProposedTimeline] = useState('')
  const [submittingProposal, setSubmittingProposal] = useState(false)

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

  // Fetch custom orders that are open for proposals
  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'orders'),
      where('type', '==', 'custom'),
      where('status', '==', 'open_for_proposals'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCustomOrders(orders)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const filteredOrders = customOrders.filter(order => {
    const matchesSearch = order.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || order.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleSubmitProposal = async () => {
    if (!proposal.trim() || !proposedPrice || !proposedTimeline) {
      alert('Please fill in all proposal details')
      return
    }

    setSubmittingProposal(true)
    try {
      // Create proposal document
      const proposalData = {
        orderId: selectedOrder.id,
        sellerId: currentUser.uid,
        sellerName: userProfile?.displayName || currentUser.email,
        sellerEmail: currentUser.email,
        proposal: proposal.trim(),
        proposedPrice: parseFloat(proposedPrice),
        proposedTimeline: proposedTimeline,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await orderService.createProposal(proposalData)

      // Notify buyer about new proposal
      await notificationService.createNotification({
        type: 'custom_order_proposal',
        title: 'New Proposal Received',
        message: `${userProfile?.displayName || 'A seller'} has submitted a proposal for your custom order`,
        recipientId: selectedOrder.buyerId,
        orderId: selectedOrder.id,
        data: {
          orderId: selectedOrder.id,
          sellerName: userProfile?.displayName || currentUser.email,
          itemTitle: selectedOrder.itemTitle,
          proposedPrice: proposedPrice
        }
      })

      // Reset form
      setProposal('')
      setProposedPrice('')
      setProposedTimeline('')
      setShowModal(false)
      setSelectedOrder(null)

      alert('Proposal submitted successfully!')
    } catch (error) {
      console.error('Error submitting proposal:', error)
      alert('Failed to submit proposal. Please try again.')
    } finally {
      setSubmittingProposal(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open_for_proposals':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading custom orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Orders Marketplace</h1>
              <p className="text-gray-600 mt-1">Browse and submit proposals for custom orders</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredOrders.length} orders available
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Newest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {order.itemTitle}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    Open for Proposals
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {categories.find(c => c.id === order.category)?.name || order.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={16} className="mr-1" />
                    <span className="font-medium">Budget: {formatCurrency(order.budget)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span>Deadline: {formatDate(order.deadline)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-1" />
                    <span>From: {order.buyerName}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {order.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} className="inline mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No custom orders found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search criteria' 
                : 'No custom orders are currently available'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedOrder.itemTitle}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {categories.find(c => c.id === selectedOrder.category)?.name || selectedOrder.category}
                    </span>
                    <span>Budget: {formatCurrency(selectedOrder.budget)}</span>
                    <span>Deadline: {formatDate(selectedOrder.deadline)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
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

                {/* Buyer Info & Proposal Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Proposal</h3>
                  
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Buyer Information</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span>{selectedOrder.buyerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2" />
                        <span>{selectedOrder.buyerEmail || 'Email not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitProposal(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Proposal *
                      </label>
                      <textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Describe how you'll approach this project, your experience, timeline, etc."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proposed Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeline (days) *
                        </label>
                        <input
                          type="number"
                          value={proposedTimeline}
                          onChange={(e) => setProposedTimeline(e.target.value)}
                          placeholder="0"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingProposal}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerCustomOrders
