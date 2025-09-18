import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

// Service for handling custom order requests
export const customOrderService = {
  // Submit custom order request
  async submitCustomOrderRequest(orderData) {
    try {
      const orderRequest = {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'custom_order_request'
      }

      // Add to custom_orders collection
      const docRef = await addDoc(collection(db, 'custom_orders'), orderRequest)
      
      // Create notification for the seller (optional - don't fail if this fails)
      try {
        await this.createSellerNotification(orderData.creatorId, {
          type: 'custom_order_request',
          title: 'New Custom Order Request',
          message: `${orderData.customerName} has requested a custom order for ${orderData.projectType}`,
          orderId: docRef.id,
          customerId: orderData.customerId,
          priority: 'high'
        })
      } catch (notificationError) {
        console.warn('Failed to create seller notification:', notificationError)
        // Continue execution even if notification fails
      }

      return docRef.id
    } catch (error) {
      console.error('Error submitting custom order request:', error)
      throw error
    }
  },

  // Create notification for seller
  async createSellerNotification(sellerId, notificationData) {
    try {
      const notification = {
        ...notificationData,
        recipientId: sellerId,
        isRead: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      await addDoc(collection(db, 'notifications'), notification)
    } catch (error) {
      console.error('Error creating seller notification:', error)
      throw error
    }
  },

  // Get WhatsApp URL with formatted message
  generateWhatsAppURL(phoneNumber, message) {
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  },

  // Format custom order message for WhatsApp
  formatCustomOrderMessage(orderData, creatorName) {
    return `Hi ${creatorName}! 

I'm interested in a custom order:

📋 Project Type: ${orderData.projectType}
💰 Budget: ₹${orderData.budget}
⏰ Timeline: ${orderData.timeline}
📝 Description: ${orderData.description}
📋 Requirements: ${orderData.requirements}

👤 My Details:
Name: ${orderData.name}
Email: ${orderData.email}
Phone: ${orderData.phone}

Let's discuss further details!`
  },

  // Track order request analytics
  async trackOrderRequest(orderData) {
    try {
      const analytics = {
        creatorId: orderData.creatorId,
        projectType: orderData.projectType,
        budget: orderData.budget,
        timestamp: serverTimestamp(),
        source: 'featured_creators'
      }

      await addDoc(collection(db, 'analytics'), analytics)
    } catch (error) {
      console.error('Error tracking order request:', error)
      // Don't throw error for analytics failures
    }
  }
}

export default customOrderService
