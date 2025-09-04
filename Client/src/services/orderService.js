import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db, logEvent } from './firebase'

class OrderService {
  // Get order by ID
  async getOrder(orderId) {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      return orderDoc.exists() ? { id: orderDoc.id, ...orderDoc.data() } : null
    } catch (error) {
      console.error('Error getting order:', error)
      throw error
    }
  }

  // Get orders for user
  async getUserOrders(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting user orders:', error)
      throw error
    }
  }

  // Get orders for seller
  async getSellerOrders(sellerId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('items.sellerId', 'array-contains', sellerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting seller orders:', error)
      throw error
    }
  }

  // Listen to order updates
  listenToOrder(orderId, callback) {
    return onSnapshot(
      doc(db, 'orders', orderId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() })
        }
      },
      (error) => {
        console.error('Error listening to order:', error)
      }
    )
  }

  // Listen to user orders
  listenToUserOrders(userId, callback, limitCount = 20) {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(orders)
    }, (error) => {
      console.error('Error listening to user orders:', error)
    })
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus, updateData = {}) {
    try {
      const updateObj = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...updateData
      }
      
      // Add status-specific fields
      switch (newStatus) {
        case 'processing':
          updateObj.processingStarted = serverTimestamp()
          break
        case 'shipped':
          updateObj.shippedAt = serverTimestamp()
          if (updateData.trackingNumber) {
            updateObj.trackingNumber = updateData.trackingNumber
          }
          if (updateData.estimatedDelivery) {
            updateObj.estimatedDelivery = updateData.estimatedDelivery
          }
          break
        case 'delivered':
          updateObj.deliveredAt = serverTimestamp()
          break
        case 'cancelled':
          updateObj.cancelledAt = serverTimestamp()
          if (updateData.cancellationReason) {
            updateObj.cancellationReason = updateData.cancellationReason
          }
          break
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateObj)
      
      // Create status update notification
      const order = await this.getOrder(orderId)
      if (order) {
        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          type: 'order_status_update',
          title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `Your order #${orderId.slice(-6)} has been ${newStatus}`,
          orderId,
          read: false,
          createdAt: serverTimestamp()
        })
        
        // Log status change event
        logEvent('order_status_change', {
          order_id: orderId,
          previous_status: order.status,
          new_status: newStatus,
          order_value: order.totalAmount
        })
      }
      
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    try {
      const updateObj = {
        paymentStatus,
        updatedAt: serverTimestamp(),
        ...paymentData
      }
      
      if (paymentStatus === 'paid') {
        updateObj.paidAt = serverTimestamp()
      } else if (paymentStatus === 'failed') {
        updateObj.paymentFailedAt = serverTimestamp()
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateObj)
      
      // If payment is successful, update order status to processing
      if (paymentStatus === 'paid') {
        await this.updateOrderStatus(orderId, 'processing')
      }
      
      return true
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason, userId) {
    try {
      const order = await this.getOrder(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }
      
      if (order.userId !== userId) {
        throw new Error('Unauthorized to cancel this order')
      }
      
      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error(`Cannot cancel order with status: ${order.status}`)
      }
      
      // Update order status
      await this.updateOrderStatus(orderId, 'cancelled', {
        cancellationReason: reason,
        cancelledBy: 'customer'
      })
      
      // If payment was made, initiate refund process
      if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
        // Note: Actual refund would be handled by webhook or admin action
        await addDoc(collection(db, 'refund_requests'), {
          orderId,
          amount: order.totalAmount,
          reason,
          status: 'pending',
          requestedBy: userId,
          requestedAt: serverTimestamp()
        })
      }
      
      // Log cancellation event
      logEvent('order_cancelled', {
        order_id: orderId,
        cancellation_reason: reason,
        order_value: order.totalAmount
      })
      
      return true
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    }
  }

  // Rate order (after delivery)
  async rateOrder(orderId, rating, review, userId) {
    try {
      const order = await this.getOrder(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }
      
      if (order.userId !== userId) {
        throw new Error('Unauthorized to rate this order')
      }
      
      if (order.status !== 'delivered') {
        throw new Error('Can only rate delivered orders')
      }
      
      // Update order with rating
      await updateDoc(doc(db, 'orders', orderId), {
        rating: Math.max(1, Math.min(5, rating)), // Ensure rating is between 1-5
        review,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Create reviews for individual items/sellers
      for (const item of order.items) {
        if (item.sellerId) {
          await addDoc(collection(db, 'reviews'), {
            orderId,
            itemId: item.id,
            sellerId: item.sellerId,
            buyerId: userId,
            buyerName: order.userName,
            rating,
            review,
            itemType: item.type,
            createdAt: serverTimestamp()
          })
        }
      }
      
      // Log review event
      logEvent('order_reviewed', {
        order_id: orderId,
        rating,
        order_value: order.totalAmount
      })
      
      return true
    } catch (error) {
      console.error('Error rating order:', error)
      throw error
    }
  }

  // Get order statistics for seller dashboard
  async getOrderStats(sellerId, timeRange = '30d') {
    try {
      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setDate(now.getDate() - 30)
      }
      
      const q = query(
        collection(db, 'orders'),
        where('items.sellerId', 'array-contains', sellerId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calculate statistics
      const stats = {
        totalOrders: orders.length,
        totalRevenue: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        averageRating: 0,
        totalReviews: 0
      }
      
      orders.forEach(order => {
        const sellerItems = order.items.filter(item => item.sellerId === sellerId)
        const sellerRevenue = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        stats.totalRevenue += sellerRevenue
        
        switch (order.status) {
          case 'delivered':
            stats.completedOrders++
            break
          case 'pending':
          case 'processing':
          case 'shipped':
            stats.pendingOrders++
            break
          case 'cancelled':
            stats.cancelledOrders++
            break
        }
        
        if (order.rating) {
          stats.averageRating += order.rating
          stats.totalReviews++
        }
      })
      
      stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
      stats.averageRating = stats.totalReviews > 0 ? stats.averageRating / stats.totalReviews : 0
      
      return stats
    } catch (error) {
      console.error('Error getting order stats:', error)
      throw error
    }
  }

  // Format order for display
  formatOrderForDisplay(order) {
    return {
      ...order,
      formattedTotal: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(order.totalAmount),
      
      formattedDate: order.createdAt?.toDate ? 
        order.createdAt.toDate().toLocaleDateString('en-IN') : 
        new Date(order.createdAt).toLocaleDateString('en-IN'),
      
      statusColor: this.getStatusColor(order.status),
      statusText: this.getStatusText(order.status)
    }
  }

  // Get status color for UI
  getStatusColor(status) {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  // Get human-readable status text
  getStatusText(status) {
    const texts = {
      pending: 'Order Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return texts[status] || status
  }
}

export const orderService = new OrderService()
export default orderService
