import React, { useState } from 'react'
import { useFirestore } from '../hooks/useRealtime'
import { useAuth } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'

const initialProduct = {
  title: '',
  price: 0,
  image: '',
  category: 'art',
  inStock: true,
  description: '',
  tags: ''
}

const initialService = {
  title: '',
  minPrice: 0,
  maxPrice: 0,
  image: '',
  category: 'tutoring',
  duration: '',
  locationType: 'online',
  description: '',
  tags: ''
}

const Sell = () => {
  const { currentUser, userProfile } = useAuth()
  const { addDocument: addProduct, loading: savingProduct } = useFirestore('products')
  const { addDocument: addService, loading: savingService } = useFirestore('services')

  const [product, setProduct] = useState(initialProduct)
  const [service, setService] = useState(initialService)
  const [message, setMessage] = useState('')

  const onChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target
    setter(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    setMessage('')
    const payload = {
      ...product,
      price: Number(product.price),
      tags: product.tags ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      creator: {
        id: currentUser?.uid || 'anon',
        name: userProfile?.displayName || currentUser?.email || 'Seller',
        avatar: userProfile?.avatar || '',
        isVerified: !!userProfile?.verified,
      },
      rating: 0,
      reviewCount: 0,
      isHandmade: false,
      isEcoFriendly: false,
      image: product.image || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'
    }
    await addProduct(payload)
    setProduct(initialProduct)
    setMessage('Product published! It will appear in Products list shortly.')
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    setMessage('')
    const payload = {
      ...service,
      minPrice: Number(service.minPrice),
      maxPrice: Number(service.maxPrice),
      tags: service.tags ? service.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      priceRange: `₹${Number(service.minPrice)}-${Number(service.maxPrice)}`,
      creator: {
        id: currentUser?.uid || 'anon',
        name: userProfile?.displayName || currentUser?.email || 'Seller',
        avatar: userProfile?.avatar || '',
        verified: !!userProfile?.verified,
      },
      rating: 0,
      reviewCount: 0,
      availability: 'available',
      image: service.image || 'https://images.unsplash.com/photo-1554048612-b6ebae896fb5?w=400'
    }
    await addService(payload)
    setService(initialService)
    setMessage('Service published! It will appear in Services list shortly.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell on CampusKala</h1>
        <p className="text-gray-600 mb-6">Add your products or services. They’ll show up on the marketplace.</p>
        {message && (
          <div className="mb-6 p-3 rounded border border-green-200 bg-green-50 text-green-800">{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Form */}
          <form onSubmit={handleCreateProduct} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" value={product.title} onChange={onChange(setProduct)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" name="price" value={product.price} onChange={onChange(setProduct)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={product.category} onChange={onChange(setProduct)} className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="art">Art & Illustration</option>
                    <option value="fashion">Fashion & Accessories</option>
                    <option value="crafts">Handmade Crafts</option>
                    <option value="tech">Tech & Gadgets</option>
                    <option value="books">Books & Stationery</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="home">Home Decor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <ImageUpload
                  onImageUpload={(url) => setProduct(prev => ({ ...prev, image: url }))}
                  currentImage={product.image}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={product.description} onChange={onChange(setProduct)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input name="tags" value={product.tags} onChange={onChange(setProduct)} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <input id="inStock" type="checkbox" name="inStock" checked={product.inStock} onChange={onChange(setProduct)} />
                <label htmlFor="inStock" className="text-sm text-gray-700">In stock</label>
              </div>
            </div>
            <button disabled={savingProduct} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
              {savingProduct ? 'Publishing...' : 'Publish Product'}
            </button>
          </form>

          {/* Service Form */}
          <form onSubmit={handleCreateService} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" value={service.title} onChange={onChange(setService)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <input type="number" name="minPrice" value={service.minPrice} onChange={onChange(setService)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input type="number" name="maxPrice" value={service.maxPrice} onChange={onChange(setService)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={service.category} onChange={onChange(setService)} className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="tutoring">Tutoring & Education</option>
                    <option value="photography">Photography</option>
                    <option value="music">Music</option>
                    <option value="tech">Tech Support</option>
                    <option value="design">Design & Creative</option>
                    <option value="fitness">Fitness & Wellness</option>
                    <option value="language">Language Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                  <select name="locationType" value={service.locationType} onChange={onChange(setService)} className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="online">Online</option>
                    <option value="campus">On Campus</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
                <ImageUpload
                  onImageUpload={(url) => setService(prev => ({ ...prev, image: url }))}
                  currentImage={service.image}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration or Details</label>
                <input name="duration" value={service.duration} onChange={onChange(setService)} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={service.description} onChange={onChange(setService)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input name="tags" value={service.tags} onChange={onChange(setService)} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
            </div>
            <button disabled={savingService} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
              {savingService ? 'Publishing...' : 'Publish Service'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Sell


