import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'

class NotificationService {
  // Create a notification
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'notifications'), notification)
      return { id: docRef.id, ...notification }
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      return q
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Notify order created
  async notifyOrderCreated(orderData) {
    try {
      const notification = {
        type: 'order_created',
        title: 'New Order Received',
        message: `You have received a new order from ${orderData.buyerName}`,
        recipientId: orderData.sellerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          buyerName: orderData.buyerName,
          totalAmount: orderData.totalAmount
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying order created:', error)
      throw error
    }
  }

  // Notify order status update
  async notifyOrderStatusUpdate(orderData, newStatus) {
    try {
      const statusMessages = {
        'approved': 'Your order has been approved',
        'rejected': 'Your order has been rejected',
        'completed': 'Your order has been completed',
        'shipped': 'Your order has been shipped',
        'delivered': 'Your order has been delivered'
      }

      const notification = {
        type: 'order_status_update',
        title: 'Order Status Update',
        message: statusMessages[newStatus] || `Your order status has been updated to ${newStatus}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          newStatus,
          sellerName: orderData.sellerName
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying order status update:', error)
      throw error
    }
  }

  // Notify proposal received
  async notifyProposalReceived(proposalData) {
    try {
      const notification = {
        type: 'proposal_received',
        title: 'New Proposal Received',
        message: `You have received a new proposal for your custom order`,
        recipientId: proposalData.buyerId,
        orderId: proposalData.orderId,
        data: {
          orderId: proposalData.orderId,
          proposalId: proposalData.id,
          sellerName: proposalData.sellerName,
          proposedPrice: proposalData.proposedPrice
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying proposal received:', error)
      throw error
    }
  }

  // Notify proposal accepted
  async notifyProposalAccepted(proposalData) {
    try {
      const notification = {
        type: 'proposal_accepted',
        title: 'Proposal Accepted',
        message: `Your proposal has been accepted for the custom order`,
        recipientId: proposalData.sellerId,
        orderId: proposalData.orderId,
        data: {
          orderId: proposalData.orderId,
          proposalId: proposalData.id,
          buyerName: proposalData.buyerName
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying proposal accepted:', error)
      throw error
    }
  }
}

export default new NotificationService()

