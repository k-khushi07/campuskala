// Simple WhatsApp service that doesn't require Firebase
export const whatsappService = {
  // Generate WhatsApp URL with formatted message
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

  // Open WhatsApp with custom order message
  openWhatsApp(phoneNumber, orderData, creatorName) {
    try {
      const message = this.formatCustomOrderMessage(orderData, creatorName)
      const whatsappUrl = this.generateWhatsAppURL(phoneNumber, message)
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank')
      
      return true
    } catch (error) {
      console.error('Error opening WhatsApp:', error)
      return false
    }
  }
}

export default whatsappService
