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
import notificationService from './notificationService'

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    try {
      const order = {
        ...orderData,
        status: orderData.status || 'pending_approval', // Allow custom status
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: 'pending',
        deliveryStatus: 'not_started'
      }
      
      const docRef = await addDoc(collection(db, 'orders'), order)
      const orderId = docRef.id
      
      // Create notification for service provider (only if seller is specified)
      if (orderData.sellerId) {
        console.log('🔔 Creating notification for seller:', orderData.sellerId, 'Order ID:', orderId)
        try {
          await notificationService.notifyOrderCreated({
            id: orderId,
            ...orderData
          })
          console.log('✅ Notification created successfully for seller:', orderData.sellerId)
        } catch (error) {
          console.error('❌ Error creating notification:', error)
        }
      }
      
      return { id: orderId, ...order }
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Get orders for a specific user (buyer)
  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      return q
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw error
    }
  }

  // Get orders for a specific seller/service provider
  async getSellerOrders(sellerId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      )
      
      return q
    } catch (error) {
      console.error('Error fetching seller orders:', error)
      throw error
    }
  }

  // Approve an order
  async approveOrder(orderId, sellerId) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer about approval
        await notificationService.notifyOrderApproved({
          id: orderId,
          ...orderData
        })
      }
      
      return true
    } catch (error) {
      console.error('Error approving order:', error)
      throw error
    }
  }

  // Reject an order
  async rejectOrder(orderId, sellerId, reason) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer about rejection
        await notificationService.notifyOrderRejected({
          id: orderId,
          ...orderData
        }, reason)
      }
      
      return true
    } catch (error) {
      console.error('Error rejecting order:', error)
      throw error
    }
  }

  // Mark order as shipped
  async shipOrder(orderId, sellerId, trackingInfo = {}) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'shipped',
        shippedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        trackingInfo: {
          trackingNumber: trackingInfo.trackingNumber || '',
          carrier: trackingInfo.carrier || '',
          estimatedDelivery: trackingInfo.estimatedDelivery || '',
          ...trackingInfo
        }
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer about shipment
        await notificationService.notifyOrderShipped({
          id: orderId,
          ...orderData
        })
      }
      
      return true
    } catch (error) {
      console.error('Error shipping order:', error)
      throw error
    }
  }

  // Mark order as delivered
  async deliverOrder(orderId, sellerId) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer about delivery
        await notificationService.notifyOrderDelivered({
          id: orderId,
          ...orderData
        })
      }
      
      return true
    } catch (error) {
      console.error('Error delivering order:', error)
      throw error
    }
  }

  // Mark order as completed
  async completeOrder(orderId, sellerId) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer about completion
        await notificationService.notifyOrderCompleted({
          id: orderId,
          ...orderData
        })
      }
      
      return true
    } catch (error) {
      console.error('Error completing order:', error)
      throw error
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateData)
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      return orderDoc.docs[0]?.data()
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  // Create order from cart items
  async createOrderFromCart(cartItems, buyerInfo) {
    try {
      const orders = []
      
      // Group items by seller
      const itemsBySeller = cartItems.reduce((acc, item) => {
        const sellerId = item.creator.id
        if (!acc[sellerId]) {
          acc[sellerId] = {
            sellerId,
            sellerName: item.creator.name,
            items: []
          }
        }
        acc[sellerId].items.push(item)
        return acc
      }, {})

      // Create separate order for each seller
      for (const [sellerId, sellerData] of Object.entries(itemsBySeller)) {
        const totalAmount = sellerData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        const orderData = {
          buyerId: buyerInfo.id,
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          sellerId: sellerData.sellerId,
          sellerName: sellerData.sellerName,
          items: sellerData.items,
          totalAmount,
          type: 'product',
          status: 'pending_approval',
          paymentMethod: 'online',
          deliveryAddress: buyerInfo.address,
          specialInstructions: buyerInfo.instructions || ''
        }
        
        const order = await this.createOrder(orderData)
        orders.push(order)
      }
      
      return orders
    } catch (error) {
      console.error('Error creating orders from cart:', error)
      throw error
    }
  }

  // Create service booking order
  async createServiceOrder(serviceData, buyerInfo, bookingDetails) {
    try {
      const orderData = {
        buyerId: buyerInfo.id,
        buyerName: buyerInfo.name,
        buyerEmail: buyerInfo.email,
        sellerId: serviceData.creator.id,
        sellerName: serviceData.creator.name,
        service: serviceData,
        totalAmount: serviceData.minPrice || 0,
        type: 'service',
        status: 'pending_approval',
        paymentMethod: 'online',
        bookingDetails: {
          preferredDate: bookingDetails.preferredDate,
          preferredTime: bookingDetails.preferredTime,
          location: bookingDetails.location,
          specialRequirements: bookingDetails.requirements || ''
        },
        deliveryAddress: buyerInfo.address,
        specialInstructions: buyerInfo.instructions || ''
      }
      
      return await this.createOrder(orderData)
    } catch (error) {
      console.error('Error creating service order:', error)
      throw error
    }
  }

  // Create a proposal for a custom order
  async createProposal(proposalData) {
    try {
      const docRef = await addDoc(collection(db, 'proposals'), proposalData)
      return { id: docRef.id, ...proposalData }
    } catch (error) {
      console.error('Error creating proposal:', error)
      throw error
    }
  }

  // Get proposals for a specific order
  async getOrderProposals(orderId) {
    try {
      const q = query(
        collection(db, 'proposals'),
        where('orderId', '==', orderId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting proposals:', error)
      throw error
    }
  }

  // Accept a proposal (buyer accepts seller's proposal)
  async acceptProposal(proposalId, orderId) {
    try {
      // Update proposal status
      await updateDoc(doc(db, 'proposals', proposalId), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get proposal data
      const proposalDoc = await getDocs(query(collection(db, 'proposals'), where('__name__', '==', proposalId)))
      const proposalData = proposalDoc.docs[0]?.data()

      if (proposalData) {
        // Update order with seller info
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'pending_approval',
          sellerId: proposalData.sellerId,
          sellerName: proposalData.sellerName,
          sellerEmail: proposalData.sellerEmail,
          acceptedProposalId: proposalId,
          acceptedPrice: proposalData.proposedPrice,
          acceptedTimeline: proposalData.proposedTimeline,
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })

        // Notify seller that their proposal was accepted
        await notificationService.createNotification({
          type: 'proposal_accepted',
          title: 'Proposal Accepted!',
          message: `Your proposal for "${proposalData.itemTitle || 'custom order'}" has been accepted`,
          recipientId: proposalData.sellerId,
          orderId: orderId,
          data: {
            orderId: orderId,
            buyerName: proposalData.buyerName,
            itemTitle: proposalData.itemTitle,
            acceptedPrice: proposalData.proposedPrice
          }
        })
      }
      
      return true
    } catch (error) {
      console.error('Error accepting proposal:', error)
      throw error
    }
  }

  // Accept a custom order (when seller accepts a custom request)
  async acceptCustomOrder(orderId, sellerId, sellerName) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'pending_approval',
        sellerId: sellerId,
        sellerName: sellerName,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get order data for notification
      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)))
      const orderData = orderDoc.docs[0]?.data()
      
      if (orderData) {
        // Notify buyer that seller accepted their custom order
        await notificationService.createNotification({
          type: 'custom_order_accepted',
          title: 'Custom Order Accepted',
          message: `${sellerName} has accepted your custom order request`,
          recipientId: orderData.buyerId,
          orderId: orderId,
          data: {
            orderId: orderId,
            sellerName: sellerName,
            itemTitle: orderData.itemTitle
          }
        })
      }
      
      return true
    } catch (error) {
      console.error('Error accepting custom order:', error)
      throw error
    }
  }
}

export default new OrderService()