// Test utility for notification system
import notificationService from '../services/notificationService'

export const testNotificationSystem = async (sellerId) => {
  console.log('🧪 Testing notification system for seller:', sellerId)
  
  try {
    // Create a test notification
    const testNotification = await notificationService.notifyOrderCreated({
      id: `test_${Date.now()}`,
      sellerId: sellerId,
      buyerName: 'Test Customer',
      buyerEmail: 'test@example.com',
      type: 'product',
      totalAmount: 100,
      items: [{
        name: 'Test Product',
        quantity: 1,
        price: 100
      }]
    })
    
    console.log('✅ Test notification created:', testNotification)
    return testNotification
  } catch (error) {
    console.error('❌ Test notification failed:', error)
    throw error
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testNotificationSystem = testNotificationSystem
}
