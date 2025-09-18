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
  // Create a new notification
  async createNotification(notificationData) {
    try {
      console.log('🔔 createNotification called with:', notificationData)
      
      const notification = {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
        type: notificationData.type || 'order'
      }
      
      console.log('🔔 Final notification object:', notification)
      const docRef = await addDoc(collection(db, 'notifications'), notification)
      console.log('✅ Notification saved to Firestore with ID:', docRef.id)
      return { id: docRef.id, ...notification }
    } catch (error) {
      console.error('❌ Error creating notification:', error)
      throw error
    }
  }

  // Get notifications for a specific user
  async getUserNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      return q
    } catch (error) {
      console.error('Error fetching notifications:', error)
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

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const notificationsQuery = await this.getUserNotifications(userId)
      const snapshot = await getDocs(notificationsQuery)
      
      const updatePromises = snapshot.docs
        .filter(doc => !doc.data().read)
        .map(doc => this.markAsRead(doc.id))
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Create order notification for service provider
  async notifyOrderCreated(orderData) {
    try {
      console.log('🔔 notifyOrderCreated called with data:', orderData)
      
      // Get the first item title or use a default
      const itemTitle = orderData.items && orderData.items.length > 0 
        ? orderData.items[0].name || orderData.items[0].title || 'Order Item'
        : orderData.itemTitle || 'Order Item'

      const notification = {
        type: 'order_created',
        title: 'New Order Received',
        message: `You have received a new ${orderData.type || 'product'} order from ${orderData.buyerName || 'Customer'}`,
        recipientId: orderData.sellerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          buyerName: orderData.buyerName || 'Customer',
          itemTitle: itemTitle,
          itemType: orderData.type || 'product',
          totalAmount: orderData.totalAmount || 0,
          quantity: orderData.items?.length || 1
        }
      }
      
      console.log('🔔 Creating notification:', notification)
      const result = await this.createNotification(notification)
      console.log('✅ Notification created successfully:', result)
      return result
    } catch (error) {
      console.error('❌ Error creating order notification:', error)
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
          totalAmount: orderData.totalAmount
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating approval notification:', error)
      throw error
    }
  }

  // Create rejection notification for buyer
  async notifyOrderRejected(orderData, reason) {
    try {
      const notification = {
        type: 'order_rejected',
        title: 'Order Rejected',
        message: `Your ${orderData.type} order was rejected by ${orderData.sellerName}. Reason: ${reason}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount,
          rejectionReason: reason
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating rejection notification:', error)
      throw error
    }
  }

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
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating completion notification:', error)
      throw error
    }
  }

  // Create shipment notification for buyer
  async notifyOrderShipped(orderData) {
    try {
      const notification = {
        type: 'order_shipped',
        title: 'Order Shipped!',
        message: `Your ${orderData.type} order has been shipped by ${orderData.sellerName}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount,
          trackingInfo: orderData.trackingInfo
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating shipment notification:', error)
      throw error
    }
  }

  // Create delivery notification for buyer
  async notifyOrderDelivered(orderData) {
    try {
      const notification = {
        type: 'order_delivered',
        title: 'Order Delivered!',
        message: `Your ${orderData.type} order has been delivered by ${orderData.sellerName}`,
        recipientId: orderData.buyerId,
        orderId: orderData.id,
        data: {
          orderId: orderData.id,
          sellerName: orderData.sellerName,
          itemTitle: orderData.itemTitle,
          itemType: orderData.type,
          totalAmount: orderData.totalAmount
        }
      }
      
      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating delivery notification:', error)
      throw error
    }
  }
}

export default new NotificationService()