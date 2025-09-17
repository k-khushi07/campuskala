import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase'

const ImageUpload = ({ 
  onImageUpload, 
  currentImage = '', 
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  folder = 'products'
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentImage)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Please use: ${acceptedTypes.join(', ')}`)
    }
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`)
    }
    return true
  }

  const uploadImage = async (file) => {
    try {
      validateFile(file)
      setError('')
      setUploading(true)
      setUploadProgress(0)
      
      // Check if user is authenticated
      const { auth } = await import('../services/firebase')
      if (!auth.currentUser) {
        throw new Error('You must be logged in to upload images')
      }

      // Create a unique filename
      const timestamp = Date.now()
      const fileName = `${folder}/${timestamp}_${file.name}`
      const storageRef = ref(storage, fileName)
      
      console.log('Uploading to:', fileName)
      console.log('Storage ref:', storageRef)

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file)

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          setError(`Upload failed: ${error.message || 'Please try again.'}`)
          setUploading(false)
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setPreview(downloadURL)
            onImageUpload(downloadURL)
            setUploading(false)
            setUploadProgress(0)
          } catch (error) {
            console.error('Error getting download URL:', error)
            setError('Failed to get image URL. Please try again.')
            setUploading(false)
          }
        }
      )
    } catch (error) {
      setError(error.message)
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeImage = () => {
    setPreview('')
    onImageUpload('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Upload className="text-purple-600 animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg mx-auto"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Image uploaded successfully</span>
            </div>
            <p className="text-xs text-gray-500">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <ImageIcon className="text-gray-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Image Preview (Full Size) */}
      {preview && !uploading && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preview</label>
          <div className="relative">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Use high-quality images for better visibility</p>
        <p>• Recommended size: 800x600 pixels or larger</p>
        <p>• Supported formats: JPEG, PNG, WEBP</p>
      </div>
    </div>
  )
}

export default ImageUpload
