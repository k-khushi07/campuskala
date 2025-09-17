import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

const ImageUploadAlt = ({ 
  onImageUpload, 
  currentImage = '', 
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  uploadMethod = 'base64' // 'base64', 'url', or 'both'
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentImage)
  const [dragActive, setDragActive] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [activeTab, setActiveTab] = useState(uploadMethod === 'both' ? 'upload' : uploadMethod)
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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const uploadImage = async (file) => {
    try {
      validateFile(file)
      setError('')
      setUploading(true)

      // Convert to base64
      const base64 = await convertToBase64(file)
      setPreview(base64)
      onImageUpload(base64)
      setUploading(false)
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

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setPreview(imageUrl)
      onImageUpload(imageUrl)
      setError('')
    } else {
      setError('Please enter a valid image URL')
    }
  }

  const removeImage = () => {
    setPreview('')
    setImageUrl('')
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
      {/* Tab Navigation (only show if both methods available) */}
      {uploadMethod === 'both' && (
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'upload'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'url'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Image URL
          </button>
        </div>
      )}

      {/* Upload Tab */}
      {(activeTab === 'upload' || uploadMethod === 'base64') && (
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
                <p className="text-sm font-medium text-gray-900">Processing image...</p>
                <p className="text-xs text-gray-500">Converting to base64 format</p>
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
                <span className="text-sm font-medium">Image ready</span>
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
      )}

      {/* URL Tab */}
      {(activeTab === 'url' || uploadMethod === 'url') && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ExternalLink size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a direct link to an image (JPG, PNG, WEBP)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Image Preview (Full Size) */}
      {preview && (
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
        {uploadMethod === 'base64' && (
          <p>• Images are stored as base64 data (no external hosting needed)</p>
        )}
        {uploadMethod === 'url' && (
          <p>• Use reliable image hosting services (Imgur, Cloudinary, etc.)</p>
        )}
      </div>

      {/* External Hosting Suggestions */}
      {uploadMethod === 'url' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Image Hosting:</h4>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• <strong>Imgur:</strong> Free, reliable, direct links</p>
            <p>• <strong>Cloudinary:</strong> Professional image management</p>
            <p>• <strong>Google Drive:</strong> Share as public link</p>
            <p>• <strong>Dropbox:</strong> Share as public link</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadAlt
