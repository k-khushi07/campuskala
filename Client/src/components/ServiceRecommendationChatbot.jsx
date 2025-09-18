import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Bot, User, Heart, Share2, Calendar, Star, Clock, MapPin } from 'lucide-react'

const ServiceRecommendationChatbot = ({ isOpen, onClose, services = [] }) => {
  const [messages, setMessages] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userPreferences, setUserPreferences] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const messagesEndRef = useRef(null)

  const questions = [
    {
      id: 'service_type',
      text: "What type of service are you looking for?",
      type: 'options',
      options: [
        { value: 'design', label: '🎨 Design & Graphics', emoji: '🎨' },
        { value: 'writing', label: '✍️ Writing & Content', emoji: '✍️' },
        { value: 'tech', label: '💻 Tech & Development', emoji: '💻' },
        { value: 'photography', label: '📸 Photography', emoji: '📸' },
        { value: 'tutoring', label: '📚 Tutoring & Education', emoji: '📚' },
        { value: 'other', label: '🔧 Other Services', emoji: '🔧' }
      ]
    },
    {
      id: 'budget',
      text: "What's your budget range?",
      type: 'options',
      options: [
        { value: 'low', label: '₹500 - ₹2,000', emoji: '💰' },
        { value: 'medium', label: '₹2,000 - ₹5,000', emoji: '💵' },
        { value: 'high', label: '₹5,000 - ₹10,000', emoji: '💎' },
        { value: 'premium', label: '₹10,000+', emoji: '🏆' }
      ]
    },
    {
      id: 'timeline',
      text: "When do you need this service completed?",
      type: 'options',
      options: [
        { value: 'urgent', label: 'Within 24 hours', emoji: '⚡' },
        { value: 'soon', label: 'Within a week', emoji: '📅' },
        { value: 'flexible', label: 'Within a month', emoji: '🗓️' },
        { value: 'no_rush', label: 'No specific deadline', emoji: '😌' }
      ]
    },
    {
      id: 'style',
      text: "What style or approach do you prefer?",
      type: 'options',
      options: [
        { value: 'modern', label: 'Modern & Clean', emoji: '✨' },
        { value: 'creative', label: 'Creative & Artistic', emoji: '🎭' },
        { value: 'professional', label: 'Professional & Formal', emoji: '👔' },
        { value: 'casual', label: 'Casual & Friendly', emoji: '😊' }
      ]
    }
  ]

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start the conversation
      setTimeout(() => {
        addMessage('bot', "Hi there! I'm Nova, your personal service assistant at CampusKala! 🌟 I'm here to help you discover amazing services tailored just for you. Let's find your perfect match!")
        setTimeout(() => {
          askQuestion(0)
        }, 1500)
      }, 500)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (sender, text, type = 'text', data = null) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      type,
      data,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const askQuestion = (questionIndex) => {
    if (questionIndex < questions.length) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        addMessage('bot', questions[questionIndex].text, 'question', questions[questionIndex])
      }, 1000)
    }
  }

  const handleAnswer = (questionId, answer) => {
    // Add user's answer
    const question = questions.find(q => q.id === questionId)
    const answerText = question.options.find(opt => opt.value === answer)?.label || answer
    addMessage('user', answerText)

    // Update preferences
    setUserPreferences(prev => ({
      ...prev,
      [questionId]: answer
    }))

    // Move to next question or show recommendations
    const nextIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex(nextIndex)

    if (nextIndex < questions.length) {
      setTimeout(() => {
        askQuestion(nextIndex)
      }, 1000)
    } else {
      // All questions answered, show recommendations
      setTimeout(() => {
        generateRecommendations()
      }, 1000)
    }
  }

  const generateRecommendations = () => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      // Filter services based on user preferences
      let filteredServices = [...services]
      
      // Filter by service type
      if (userPreferences.service_type && userPreferences.service_type !== 'other') {
        filteredServices = filteredServices.filter(service => 
          service.category?.toLowerCase().includes(userPreferences.service_type) ||
          service.title?.toLowerCase().includes(userPreferences.service_type)
        )
      }
      
      // Filter by budget
      if (userPreferences.budget) {
        const budgetRanges = {
          low: [0, 2000],
          medium: [2000, 5000],
          high: [5000, 10000],
          premium: [10000, Infinity]
        }
        const [min, max] = budgetRanges[userPreferences.budget]
        filteredServices = filteredServices.filter(service => {
          const price = parseFloat(service.price) || 0
          return price >= min && price <= max
        })
      }
      
      // Get top 3-5 recommendations
      const topRecommendations = filteredServices
        .sort(() => Math.random() - 0.5) // Shuffle for variety
        .slice(0, 4)
      
      setRecommendations(topRecommendations)
      setShowRecommendations(true)
      
      addMessage('bot', `Fantastic! I've analyzed your preferences and found ${topRecommendations.length} incredible services that are perfect for you! 🚀 These recommendations are specially curated just for you, Nova style! ✨`, 'recommendations')
    }, 1500)
  }

  const handleBookService = (service) => {
    // Navigate to service booking or open booking modal
    addMessage('user', `I want to book: ${service.title}`)
    setTimeout(() => {
      addMessage('bot', `Excellent choice! I'm excited to help you book "${service.title}"! 🎉 Let me get you connected with this amazing service right away! ⚡`)
    }, 1000)
  }

  const handleSaveService = (service) => {
    // Add to wishlist logic
    addMessage('user', `Save "${service.title}" for later`)
    setTimeout(() => {
      addMessage('bot', `Perfect! I've saved "${service.title}" to your wishlist! 💫 Nova's got your back - you can always come back to it later! ✨`)
    }, 1000)
  }

  const handleShareService = (service) => {
    // Share functionality
    addMessage('user', `Share "${service.title}"`)
    setTimeout(() => {
      addMessage('bot', `Awesome! I'm sharing "${service.title}" with your friends! 🌟 Great finds deserve to be shared - Nova's spreading the good vibes! 📤✨`)
    }, 1000)
  }

  const resetChat = () => {
    setMessages([])
    setCurrentQuestionIndex(0)
    setUserPreferences({})
    setShowRecommendations(false)
    setRecommendations([])
  }

  const renderMessage = (message) => {
    if (message.type === 'question') {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Bot is typing...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {message.data.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(message.data.id, option.value)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="font-medium text-gray-800 group-hover:text-purple-700">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (message.type === 'recommendations') {
      return (
        <div className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((service, index) => (
              <div key={service.id || index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{service.title || 'Service Title'}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.description || 'Professional service description...'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>2-3 days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Remote</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-purple-600">
                        ₹{service.price || '2,500'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveService(service)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Save for later"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareService(service)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBookService(service)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <button
              onClick={resetChat}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Chat with Nova Again
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.sender === 'bot' 
            ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600'
        }`}>
          {message.sender === 'bot' ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.sender === 'bot'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white ml-auto'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Nova</h2>
              <p className="text-sm text-gray-500">Your personal service assistant ✨</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

export default ServiceRecommendationChatbot
