import React, { useState } from 'react'
import { X, Star, MessageCircle, ExternalLink, Camera, Phone, MapPin, Briefcase, CheckCircle, AlertCircle, Sparkles, Award, TrendingUp, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import ImageUpload from './ImageUpload'

const FeaturedCreatorModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    whatsapp: '',
    specialty: '',
    bio: '',
    portfolio: '',
    avatar: userProfile?.avatar || '',
    location: '',
    experience: '',
    isAvailable: true,
    rating: 0,
    orders: 0
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
      if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp number is required'
      if (!formData.avatar) newErrors.avatar = 'Profile picture is required'
    }
    
    if (step === 2) {
      if (!formData.specialty) newErrors.specialty = 'Specialty is required'
      if (!formData.experience) newErrors.experience = 'Experience level is required'
      if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all steps before submitting
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1) // Go back to first step with errors
      return
    }
    
    setIsSubmitting(true)
    setMessage('')

    try {
      const creatorData = {
        ...formData,
        userId: currentUser?.uid,
        isVerified: true, // Auto-verify for immediate display
        isFeatured: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'approved', // Auto-approve for immediate display
        approvedAt: serverTimestamp()
      }

      console.log('Submitting creator data:', creatorData)
      const docRef = await addDoc(collection(db, 'featured_creators'), creatorData)
      console.log('Creator document created with ID:', docRef.id)
      
      setMessage('🎉 Congratulations! You are now a featured creator! Your profile will appear on the homepage shortly.')
      
      // Reset form after successful submission
      setTimeout(() => {
        onClose()
        setMessage('')
        setFormData({
          name: userProfile?.displayName || '',
          email: currentUser?.email || '',
          phone: userProfile?.phone || '',
          whatsapp: '',
          specialty: '',
          bio: '',
          portfolio: '',
          avatar: userProfile?.avatar || '',
          location: '',
          experience: '',
          isAvailable: true,
          rating: 0,
          orders: 0
        })
      }, 3000)

    } catch (error) {
      console.error('Error submitting featured creator application:', error)
      setMessage('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const steps = [
    { id: 1, title: 'Personal Info', icon: <Camera size={20} /> },
    { id: 2, title: 'Professional', icon: <Briefcase size={20} /> },
    { id: 3, title: 'Review', icon: <CheckCircle size={20} /> }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Become a Featured Creator</h2>
                <p className="text-purple-100 mt-1">Join our exclusive community and get featured on our homepage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-white text-purple-600 border-white' 
                      : 'bg-transparent text-white border-white border-opacity-50'
                  }`}>
                    {currentStep > step.id ? <CheckCircle size={20} /> : step.icon}
                  </div>
                  <span className={`ml-3 font-medium transition-colors ${
                    currentStep >= step.id ? 'text-white' : 'text-purple-200'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 transition-colors ${
                      currentStep > step.id ? 'bg-white' : 'bg-white bg-opacity-30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Tell us about yourself and how to contact you</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                          errors.name ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                          errors.email ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                          errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                          errors.whatsapp ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="919876543210 (with country code)"
                      />
                      {errors.whatsapp && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.whatsapp}</p>}
                      <p className="text-gray-500 text-sm mt-2">This will be used for custom order requests</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                        placeholder="Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Profile Picture *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                        <ImageUpload
                          onImageUpload={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                          currentImage={formData.avatar}
                          className="mx-auto"
                        />
                        {errors.avatar && <p className="text-red-500 text-sm mt-2 flex items-center justify-center"><AlertCircle size={16} className="mr-1" /> {errors.avatar}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Information</h3>
                  <p className="text-gray-600">Tell us about your skills and experience</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Specialty *
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                        errors.specialty ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                      }`}
                    >
                      <option value="">Select your specialty</option>
                      <option value="Digital Art & Illustration">Digital Art & Illustration</option>
                      <option value="Fashion Design">Fashion Design</option>
                      <option value="Handmade Crafts">Handmade Crafts</option>
                      <option value="Photography">Photography</option>
                      <option value="Music & Audio">Music & Audio</option>
                      <option value="Tech & Programming">Tech & Programming</option>
                      <option value="Writing & Content">Writing & Content</option>
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="Interior Design">Interior Design</option>
                      <option value="Culinary Arts">Culinary Arts</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.specialty && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.specialty}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Experience Level *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                        errors.experience ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                      }`}
                    >
                      <option value="">Select your experience level</option>
                      <option value="Beginner (0-1 years)">Beginner (0-1 years)</option>
                      <option value="Intermediate (1-3 years)">Intermediate (1-3 years)</option>
                      <option value="Advanced (3-5 years)">Advanced (3-5 years)</option>
                      <option value="Expert (5+ years)">Expert (5+ years)</option>
                    </select>
                    {errors.experience && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.experience}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Bio *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all resize-none ${
                        errors.bio ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                      }`}
                      placeholder="Tell us about yourself, your skills, what makes you unique, and why you'd be a great featured creator..."
                    />
                    {errors.bio && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {errors.bio}</p>}
                    <p className="text-gray-500 text-sm mt-2">Minimum 100 characters recommended</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Portfolio Link
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                      placeholder="https://your-portfolio.com or Instagram profile"
                    />
                    <p className="text-gray-500 text-sm mt-2">Share your best work to showcase your talent</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <input
                        id="isAvailable"
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        I am currently available to take custom orders
                      </label>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">You can change this anytime after approval</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h3>
                  <p className="text-gray-600">Please review your information before submitting</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Camera size={20} className="mr-2 text-purple-600" />
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Name:</span>
                          <p className="text-gray-900">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Email:</span>
                          <p className="text-gray-900">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Phone:</span>
                          <p className="text-gray-900">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">WhatsApp:</span>
                          <p className="text-gray-900">{formData.whatsapp}</p>
                        </div>
                        {formData.location && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Location:</span>
                            <p className="text-gray-900">{formData.location}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Briefcase size={20} className="mr-2 text-blue-600" />
                        Professional Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Specialty:</span>
                          <p className="text-gray-900">{formData.specialty}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Experience:</span>
                          <p className="text-gray-900">{formData.experience}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Availability:</span>
                          <p className="text-gray-900">{formData.isAvailable ? 'Available for custom orders' : 'Currently busy'}</p>
                        </div>
                        {formData.portfolio && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Portfolio:</span>
                            <p className="text-blue-600 break-all">{formData.portfolio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio:</span>
                    <p className="text-gray-900 mt-2 leading-relaxed">{formData.bio}</p>
                  </div>

                  {formData.avatar && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Profile Picture:</span>
                      <div className="mt-3">
                        <img src={formData.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Navigation Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {message && (
                <div className={`flex items-center px-4 py-2 rounded-lg ${
                  message.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message.includes('Error') ? <AlertCircle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="text-purple-600 mr-2" size={20} />
            Featured Creator Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="text-purple-600" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Homepage Featured</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="text-green-600" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">WhatsApp Integration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ExternalLink className="text-blue-600" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Portfolio Showcase</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Priority Visibility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedCreatorModal
