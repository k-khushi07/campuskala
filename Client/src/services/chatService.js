import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore'
import { db, logEvent } from './firebase'

class ChatService {
  // Create a new chat conversation
  async createConversation(participants, initialMessage = null) {
    try {
      const conversationData = {
        participants: participants.map(p => p.uid || p),
        participantDetails: participants.map(p => ({
          uid: p.uid || p,
          displayName: p.displayName || 'Unknown User',
          avatar: p.avatar || p.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50'
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: initialMessage || '',
        lastMessageAt: serverTimestamp(),
        messageCount: 0,
        status: 'active' // active, archived, blocked
      }

      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData)
      
      // If there's an initial message, send it
      if (initialMessage) {
        await this.sendMessage(conversationRef.id, participants[0].uid, initialMessage, 'text')
      }

      logEvent('chat_conversation_created', {
        conversation_id: conversationRef.id,
        participant_count: participants.length
      })

      return conversationRef.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  // Send a message in a conversation
  async sendMessage(conversationId, senderId, content, type = 'text', metadata = {}) {
    try {
      const messageData = {
        conversationId,
        senderId,
        content,
        type, // text, image, file, order_inquiry, service_request
        metadata, // Additional data like file URLs, order details, etc.
        createdAt: serverTimestamp(),
        edited: false,
        editedAt: null,
        readBy: [senderId], // Array of user IDs who have read this message
        reactions: {} // Object for message reactions
      }

      const messageRef = await addDoc(collection(db, 'messages'), messageData)

      // Update conversation with last message info
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: type === 'text' ? content : `Sent a ${type}`,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: await this.getMessageCount(conversationId) + 1
      })

      logEvent('chat_message_sent', {
        conversation_id: conversationId,
        message_type: type,
        content_length: content.length
      })

      return messageRef.id
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Listen to messages in a conversation
  listenToMessages(conversationId, callback, limitCount = 50) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })).reverse() // Reverse to show oldest first

      callback(messages)
    }, (error) => {
      console.error('Error listening to messages:', error)
    })
  }

  // Listen to user's conversations
  listenToConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate?.() || new Date()
      }))

      callback(conversations)
    }, (error) => {
      console.error('Error listening to conversations:', error)
    })
  }

  // Load older messages (pagination)
  async loadOlderMessages(conversationId, lastMessage, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        startAfter(lastMessage.createdAt),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })).reverse()
    } catch (error) {
      console.error('Error loading older messages:', error)
      throw error
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, userId, messageIds = []) {
    try {
      const batch = []
      
      if (messageIds.length > 0) {
        // Mark specific messages as read
        for (const messageId of messageIds) {
          const messageRef = doc(db, 'messages', messageId)
          batch.push(updateDoc(messageRef, {
            readBy: arrayUnion(userId)
          }))
        }
      } else {
        // Mark all unread messages in conversation as read
        const q = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          where('readBy', 'not-in', [[userId]])
        )
        
        const snapshot = await getDocs(q)
        snapshot.docs.forEach(doc => {
          batch.push(updateDoc(doc.ref, {
            readBy: arrayUnion(userId)
          }))
        })
      }

      await Promise.all(batch)
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }

  // Get unread message count for a conversation
  async getUnreadCount(conversationId, userId) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.filter(doc => 
        !doc.data().readBy?.includes(userId)
      ).length
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Search conversations
  async searchConversations(userId, searchTerm) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      )

      const snapshot = await getDocs(q)
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Filter conversations based on participant names or last message
      return conversations.filter(conv => {
        const participantMatch = conv.participantDetails?.some(p => 
          p.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const messageMatch = conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
        return participantMatch || messageMatch
      })
    } catch (error) {
      console.error('Error searching conversations:', error)
      throw error
    }
  }

  // Block/Unblock user in conversation
  async updateConversationStatus(conversationId, status, userId) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      })

      logEvent('chat_conversation_status_changed', {
        conversation_id: conversationId,
        new_status: status
      })
    } catch (error) {
      console.error('Error updating conversation status:', error)
      throw error
    }
  }

  // Send order inquiry message
  async sendOrderInquiry(sellerId, buyerId, productId, message) {
    try {
      const participants = [
        { uid: buyerId },
        { uid: sellerId }
      ]

      const conversationId = await this.createConversation(participants)
      
      await this.sendMessage(
        conversationId,
        buyerId,
        message,
        'order_inquiry',
        {
          productId,
          inquiryType: 'product_question',
          timestamp: new Date().toISOString()
        }
      )

      return conversationId
    } catch (error) {
      console.error('Error sending order inquiry:', error)
      throw error
    }
  }

  // Send service booking message
  async sendServiceBooking(freelancerId, clientId, serviceId, message, bookingDetails) {
    try {
      const participants = [
        { uid: clientId },
        { uid: freelancerId }
      ]

      const conversationId = await this.createConversation(participants)
      
      await this.sendMessage(
        conversationId,
        clientId,
        message,
        'service_request',
        {
          serviceId,
          bookingDetails,
          requestType: 'service_booking',
          timestamp: new Date().toISOString()
        }
      )

      return conversationId
    } catch (error) {
      console.error('Error sending service booking:', error)
      throw error
    }
  }

  // Get message count for conversation
  async getMessageCount(conversationId) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error getting message count:', error)
      return 0
    }
  }

  // Format message for display
  formatMessageForDisplay(message, currentUserId) {
    return {
      ...message,
      isOwn: message.senderId === currentUserId,
      formattedTime: this.formatMessageTime(message.createdAt),
      isRead: message.readBy?.includes(currentUserId) || false
    }
  }

  // Format message timestamp
  formatMessageTime(timestamp) {
    if (!timestamp) return ''
    
    const now = new Date()
    const messageTime = timestamp instanceof Date ? timestamp : timestamp.toDate()
    const diffMs = now - messageTime
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return messageTime.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }
}

export const chatService = new ChatService()
export default chatService
