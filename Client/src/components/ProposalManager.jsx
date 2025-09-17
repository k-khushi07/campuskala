import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Star,
  DollarSign,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import notificationService from '../services/notificationService'

const ProposalManager = ({ orderId, orderData, onProposalAccepted }) => {
  const { currentUser } = useAuth()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch proposals for this order
  useEffect(() => {
    if (!orderId) return

    const q = query(
      collection(db, 'proposals'),
      where('orderId', '==', orderId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const proposalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProposals(proposalsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [orderId])

  const handleAcceptProposal = async (proposalId) => {
    setActionLoading(true)
    try {
      await orderService.acceptProposal(proposalId, orderId)
      
      // Notify seller
      const proposal = proposals.find(p => p.id === proposalId)
      if (proposal) {
        await notificationService.createNotification({
          type: 'proposal_accepted',
          title: 'Proposal Accepted!',
          message: `Your proposal for "${orderData.itemTitle}" has been accepted`,
          recipientId: proposal.sellerId,
          orderId: orderId,
          data: {
            orderId: orderId,
            buyerName: orderData.buyerName,
            itemTitle: orderData.itemTitle,
            acceptedPrice: proposal.proposedPrice
          }
        })
      }

      if (onProposalAccepted) {
        onProposalAccepted(proposalId)
      }

      setShowModal(false)
      setSelectedProposal(null)
      alert('Proposal accepted successfully!')
    } catch (error) {
      console.error('Error accepting proposal:', error)
      alert('Failed to accept proposal. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectProposal = async (proposalId) => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'proposals', proposalId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Notify seller
      const proposal = proposals.find(p => p.id === proposalId)
      if (proposal) {
        await notificationService.createNotification({
          type: 'proposal_rejected',
          title: 'Proposal Update',
          message: `Your proposal for "${orderData.itemTitle}" was not selected`,
          recipientId: proposal.sellerId,
          orderId: orderId,
          data: {
            orderId: orderId,
            buyerName: orderData.buyerName,
            itemTitle: orderData.itemTitle
          }
        })
      }

      setShowModal(false)
      setSelectedProposal(null)
      alert('Proposal rejected.')
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      alert('Failed to reject proposal. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Proposals ({proposals.length})</h3>
        {orderData.status === 'open_for_proposals' && (
          <span className="text-sm text-blue-600 font-medium">Accepting proposals</span>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h4>
          <p className="text-gray-600">Proposals from sellers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{proposal.sellerName}</h4>
                    <p className="text-sm text-gray-500">{proposal.sellerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal)
                      setShowModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign size={16} className="text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Price</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(proposal.proposedPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar size={16} className="text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Timeline</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600">
                    {proposal.proposedTimeline} days
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock size={16} className="text-gray-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Submitted</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(proposal.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {proposal.proposal}
              </p>

              {proposal.status === 'pending' && orderData.status === 'open_for_proposals' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptProposal(proposal.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <ThumbsUp size={16} className="inline mr-1" />
                    Accept Proposal
                  </button>
                  <button
                    onClick={() => handleRejectProposal(proposal.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <ThumbsDown size={16} className="inline mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proposal Details Modal */}
      {showModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Proposal Details</h2>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedProposal.sellerName}</h3>
                      <p className="text-sm text-gray-500">{selectedProposal.sellerEmail}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <DollarSign size={20} className="text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Proposed Price</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedProposal.proposedPrice)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Calendar size={20} className="text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Timeline</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedProposal.proposedTimeline} days
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proposal Details</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProposal.proposal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-2" />
                  <span>Submitted on {formatDate(selectedProposal.createdAt)}</span>
                </div>

                {selectedProposal.status === 'pending' && orderData.status === 'open_for_proposals' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAcceptProposal(selectedProposal.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <ThumbsUp size={20} className="inline mr-2" />
                      Accept This Proposal
                    </button>
                    <button
                      onClick={() => handleRejectProposal(selectedProposal.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <ThumbsDown size={20} className="inline mr-2" />
                      Reject Proposal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalManager
