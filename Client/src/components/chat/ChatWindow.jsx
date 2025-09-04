import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import chatService from '../../services/chatService'

const ChatWindow = ({ conversationId, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const { currentUser } = useAuth()
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    if (!conversationId) return

    // Listen to messages
    const unsubscribeMessages = chatService.listenToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages.map(msg => 
          chatService.formatMessageForDisplay(msg, currentUser.uid)
        ))
      }
    )

    // Get conversation details
    const getConversationDetails = async () => {
      try {
        const convDoc = await getDoc(doc(db, 'conversations', conversationId))
        if (convDoc.exists()) {
          setConversation({ id: convDoc.id, ...convDoc.data() })
        }
      } catch (error) {
        console.error('Error getting conversation details:', error)
      }
    }

    getConversationDetails()

    // Mark messages as read when component mounts
    chatService.markMessagesAsRead(conversationId, currentUser.uid)

    return () => {
      unsubscribeMessages()
    }
  }, [conversationId, currentUser.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      await chatService.sendMessage(
        conversationId,
        currentUser.uid,
        newMessage.trim(),
        'text'
      )
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const getOtherParticipant = () => {
    if (!conversation || !conversation.participantDetails) return null
    return conversation.participantDetails.find(p => p.uid !== currentUser.uid)
  }

  const otherParticipant = getOtherParticipant()

  const MessageBubble = ({ message }) => {
    const isOwn = message.isOwn
    
    return (
      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <img
            src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32'}
            alt=""
            className="w-8 h-8 rounded-full mr-3 mt-1"
          />
        )}
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.type === 'order_inquiry' && (
              <div className="mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                <div className="text-xs text-blue-600 font-medium">Order Inquiry</div>
                <div className="text-sm text-blue-700">About Product #{message.metadata?.productId?.slice(-6)}</div>
              </div>
            )}
            
            {message.type === 'service_request' && (
              <div className="mb-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                <div className="text-xs text-green-600 font-medium">Service Request</div>
                <div className="text-sm text-green-700">Service Booking Inquiry</div>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.edited && (
              <span className="text-xs opacity-75">(edited)</span>
            )}
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {message.formattedTime}
            {isOwn && message.isRead && (
              <span className="ml-1 text-blue-500">✓</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h3>
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40'}
              alt=""
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {otherParticipant?.displayName || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">
                {isTyping ? 'Typing...' : 'Active now'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 bg-gray-50"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
