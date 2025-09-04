//import React, { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Star, Heart, ShoppingCart, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'art', name: 'Art & Illustration' },
    { id: 'fashion', name: 'Fashion & Accessories' },
    { id: 'crafts', name: 'Handmade Crafts' },
    { id: 'tech', name: 'Tech & Gadgets' },
    { id: 'books', name: 'Books & Stationery' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'home', name: 'Home Decor' },
  ]

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  // Expanded sample products
  const products = [
    {
      id: 1,
      title: 'Hand-painted Canvas Art',
      price: 1200,
      originalPrice: 1500,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
      creator: { id: 1, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100' },
      rating: 4.8,
      reviewCount: 24,
      category: 'art',
      tags: ['canvas', 'painting', 'abstract'],
      description: 'Beautiful hand-painted abstract canvas art perfect for modern homes.',
      inStock: true,
      discount: 20,
      isFavorite: false,
      isNew: true
    },
    {
      id: 2,
      title: 'Custom T-shirt Design',
      price: 450,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      creator: { id: 2, name: 'Raj Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
      rating: 4.6,
      reviewCount: 18,
      category: 'fashion',
      tags: ['t-shirt', 'custom', 'print'],
      description: 'Personalized t-shirt designs with high-quality printing.',
      inStock: true,
      isFavorite: true,
      isNew: false
    },
    {
      id: 3,
      title: 'Handmade Jewelry Set',
      price: 800,
      originalPrice: 950,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      creator: { id: 3, name: 'Anita Kumar', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      rating: 4.9,
      reviewCount: 32,
      category: 'jewelry',
      tags: ['handmade', 'silver', 'earrings'],
      description: 'Elegant handcrafted silver jewelry set including necklace and earrings.',
      inStock: true,
      discount: 16,
      isFavorite: false,
      isNew: false
    },
    {
      id: 4,
      title: 'Digital Portrait Art',
      price: 600,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      creator: { id: 4, name: 'Vikash Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      rating: 4.7,
      reviewCount: 15,
      category: 'art',
      tags: ['digital', 'portrait', 'custom'],
      description: 'Professional digital portrait artwork from your photos.',
      inStock: true,
      isFavorite: false,
      isNew: true
    },
    {
      id: 5,
      title: 'Ceramic Coffee Mug',
      price: 350,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
      creator: { id: 5, name: 'Sonal Dave', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
      rating: 4.5,
      reviewCount: 12,
      category: 'home',
      tags: ['ceramic', 'mug', 'handmade'],
      description: 'Beautiful ceramic coffee mug with unique glazing patterns.',
      inStock: true,
      isFavorite: true,
      isNew: false
    },
    {
      id: 6,
      title: 'Laptop Stickers Pack',
      price: 200,
      originalPrice: 250,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      creator: { id: 6, name: 'Karan Joshi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      rating: 4.4,
      reviewCount: 8,
      category: 'tech',
      tags: ['stickers', 'laptop', 'pack'],
      description: 'Premium quality laptop stickers pack with 20 unique designs.',
      inStock: false,
      discount: 20,
      isFavorite: false,
      isNew: false
    }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.isNew - a.isNew
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return b.reviewCount - a.reviewCount
    }
  })

  const toggleFavorite = (productId) => {
    // Handle favorite toggle
    console.log('Toggle favorite:', productId)
  }

  const addToCart = (product) => {
    // Handle add to cart
    console.log('Add to cart:', product.id)
  }

  const handleCreatorClick = (creator) => {
    // Navigate to creator profile
    console.log('Navigate to creator:', creator.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
              <p className="text-gray-600 mt-1">Discover amazing creations from talented students</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Quick Filters</h4>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">On Sale</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">New Arrivals</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">In Stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                </button>
                <span className="text-sm text-gray-600">
                  {sortedProducts.length} products found
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {sortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onCreatorClick={handleCreatorClick}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setPriceRange([0, 5000])
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products