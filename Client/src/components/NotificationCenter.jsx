import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  User, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import notificationService from '../services/notificationService'
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore'
import { db } from '../services/firebase'

const NotificationCenter = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return

    // Listen to notifications in real-time
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter(n => !n.read).length)
    })

    return () => unsubscribe()
  }, [currentUser])

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <Package className="text-blue-600" size={20} />
      case 'order_approved':
        return <CheckCircle className="text-green-600" size={20} />
      case 'order_rejected':
        return <AlertCircle className="text-red-600" size={20} />
      case 'order_completed':
        return <Package className="text-purple-600" size={20} />
      default:
        return <Bell className="text-gray-600" size={20} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_created':
        return 'border-l-blue-500'
      case 'order_approved':
        return 'border-l-green-500'
      case 'order_rejected':
        return 'border-l-red-500'
      case 'order_completed':
        return 'border-l-purple-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle navigation based on notification type
    if (notification.orderId) {
      // Navigate to order details or order management
      console.log('Navigate to order:', notification.orderId)
    }
  }

  if (!currentUser) return null

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {/* Additional Data */}
                      {notification.data && (
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.data.itemTitle && (
                            <p>Item: {notification.data.itemTitle}</p>
                          )}
                          {notification.data.totalAmount && (
                            <p>Amount: ₹{notification.data.totalAmount.toLocaleString()}</p>
                          )}
                          {notification.data.rejectionReason && (
                            <p className="text-red-600">
                              Reason: {notification.data.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDropdown(false)
                  // Navigate to full notifications page
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default NotificationCenter
