import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  serverTimestamp,
  getDocs
=======
  serverTimestamp 
>>>>>>> Stashed changes
=======
  serverTimestamp 
>>>>>>> Stashed changes
} from 'firebase/firestore'
import { db } from './firebase'

class NotificationService {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Create a notification
=======
  // Create a new notification
>>>>>>> Stashed changes
=======
  // Create a new notification
>>>>>>> Stashed changes
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        read: false,
        createdAt: serverTimestamp()
=======
        createdAt: serverTimestamp(),
        read: false,
        type: notificationData.type || 'order'
>>>>>>> Stashed changes
=======
        createdAt: serverTimestamp(),
        read: false,
        type: notificationData.type || 'order'
>>>>>>> Stashed changes
      }
      
      const docRef = await addDoc(collection(db, 'notifications'), notification)
      return { id: docRef.id, ...notification }
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Get notifications for a user
=======
  // Get notifications for a specific user
>>>>>>> Stashed changes
=======
  // Get notifications for a specific user
>>>>>>> Stashed changes
  async getUserNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      return q
    } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      console.error('Error fetching user notifications:', error)
=======
      console.error('Error fetching notifications:', error)
>>>>>>> Stashed changes
=======
      console.error('Error fetching notifications:', error)
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Notify order created
=======
=======
>>>>>>> Stashed changes
  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      )
      
      // This would need to be implemented with batch updates
      // For now, we'll handle this in the component
    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  // Create order notification for service provider
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  async notifyOrderCreated(orderData) {
    try {
      const notification = {
        type: 'order_created',
        title: 'New Order Received',
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        message: `You have received a new order from ${orderData.buyerName}`,
=======
        message: `You have received a new ${orderData.type} order from ${orderData.buyerName}`,
>>>>>>> Stashed changes
=======
        message: `You have received a new ${orderData.type} order from ${orderData.buyerName}`,
>>>>>>> Stashed changes
        recipientId: orderData.sellerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          buyerName: orderData.buyerName,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount,
          quantity: orderData.quantity
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating order notification:', error)
      throw error
    }
  }

  // Create approval notification for buyer
  async notifyOrderApproved(orderData) {
    try {
      const notification = {
        type: 'order_approved',
        title: 'Order Approved',
        message: `Your ${orderData.type} order has been approved by ${orderData.sellerName}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          totalAmount: orderData.totalAmount
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      console.error('Error notifying order created:', error)
=======
      console.error('Error creating approval notification:', error)
>>>>>>> Stashed changes
=======
      console.error('Error creating approval notification:', error)
>>>>>>> Stashed changes
      throw error
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
  // Create rejection notification for buyer
  async notifyOrderRejected(orderData, reason) {
    try {
      const notification = {
        type: 'order_rejected',
        title: 'Order Rejected',
        message: `Your ${orderData.type} order was rejected by ${orderData.sellerName}. Reason: ${reason}`,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          newStatus,
          sellerName: orderData.sellerName
=======
=======
>>>>>>> Stashed changes
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount,
          rejectionReason: reason
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      console.error('Error notifying order status update:', error)
=======
      console.error('Error creating rejection notification:', error)
>>>>>>> Stashed changes
=======
      console.error('Error creating rejection notification:', error)
>>>>>>> Stashed changes
      throw error
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
  // Create order completion notification
  async notifyOrderCompleted(orderData) {
    try {
      const notification = {
        type: 'order_completed',
        title: 'Order Completed',
        message: `Your ${orderData.type} order has been completed by ${orderData.sellerName}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
      console.error('Error creating completion notification:', error)
>>>>>>> Stashed changes
=======
      console.error('Error creating completion notification:', error)
>>>>>>> Stashed changes
      throw error
    }
  }
}

export default new NotificationService()
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
