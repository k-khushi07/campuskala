import React, { useState } from 'react';
import './products.css';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');

  // Sample product data
  const products = [
    {
      id: 1,
      title: "Handwoven Cotton Scarf",
      price: 45,
      originalPrice: 60,
      image: "/api/placeholder/250/250",
      rating: 4.8,
      reviews: 124,
      seller: "CraftsByAisha",
      category: "accessories",
      tags: ["handwoven", "cotton", "sustainable"],
      featured: true
    },
    {
      id: 2,
      title: "Custom Portrait Drawing",
      price: 85,
      image: "/api/placeholder/250/250",
      rating: 4.9,
      reviews: 89,
      seller: "ArtStudioMumbai",
      category: "art",
      tags: ["custom", "portrait", "pencil"],
      featured: true
    },
    {
      id: 3,
      title: "Handmade Ceramic Mug Set",
      price: 120,
      originalPrice: 150,
      image: "/api/placeholder/250/250",
      rating: 4.7,
      reviews: 67,
      seller: "ClayWorksByPriya",
      category: "home",
      tags: ["ceramic", "handmade", "set"],
      featured: false
    },
    {
      id: 4,
      title: "Embroidered Cushion Covers",
      price: 35,
      image: "/api/placeholder/250/250",
      rating: 4.6,
      reviews: 156,
      seller: "ThreadAndNeedle",
      category: "home",
      tags: ["embroidered", "cushion", "traditional"],
      featured: true
    },
    {
      id: 5,
      title: "Handcrafted Wooden Jewelry Box",
      price: 200,
      originalPrice: 250,
      image: "/api/placeholder/250/250",
      rating: 4.9,
      reviews: 43,
      seller: "WoodenWonders",
      category: "accessories",
      tags: ["wooden", "handcrafted", "jewelry"],
      featured: false
    },
    {
      id: 6,
      title: "Digital Marketing Course Notes",
      price: 25,
      image: "/api/placeholder/250/250",
      rating: 4.5,
      reviews: 234,
      seller: "StudyBuddy2024",
      category: "education",
      tags: ["notes", "digital marketing", "course"],
      featured: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'art', name: 'Art & Crafts', count: products.filter(p => p.category === 'art').length },
    { id: 'home', name: 'Home & Decor', count: products.filter(p => p.category === 'home').length },
    { id: 'accessories', name: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
    { id: 'education', name: 'Study Materials', count: products.filter(p => p.category === 'education').length }
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'reviews': return b.reviews - a.reviews;
      default: return b.featured - a.featured;
    }
  });

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div className="header-content">
          <h1>Handmade Products</h1>
          <p>Discover unique, handcrafted items made by talented students and creators</p>
        </div>
        <div className="header-stats">
          <span>{products.length}+ Products</span>
          <span>500+ Happy Customers</span>
          <span>50+ Creators</span>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-filter">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="price-slider"
              />
              <div className="price-display">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Featured Badges</h3>
            <div className="badge-filters">
              <label><input type="checkbox" /> Student Verified</label>
              <label><input type="checkbox" /> Fast Delivery</label>
              <label><input type="checkbox" /> Custom Orders</label>
              <label><input type="checkbox" /> Eco-Friendly</label>
            </div>
          </div>
        </div>

        {/* Main Products Area */}
        <div className="products-main">
          {/* Sort Bar */}
          <div className="sort-bar">
            <div className="results-count">
              {sortedProducts.length} products found
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {sortedProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                  {product.featured && <span className="featured-badge">Featured</span>}
                  {product.originalPrice && (
                    <span className="discount-badge">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  <div className="product-overlay">
                    <button className="quick-view-btn">Quick View</button>
                    <button className="add-to-cart-btn">Add to Cart</button>
                  </div>
                </div>
                
                <div className="product-info">
                  <div className="product-tags">
                    {product.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <h3 className="product-title">{product.title}</h3>
                  
                  <div className="seller-info">
                    <span>by {product.seller}</span>
                    <div className="verification-badge">✓</div>
                  </div>
                  
                  <div className="rating-reviews">
                    <div className="stars">
                      {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5-Math.floor(product.rating))}
                    </div>
                    <span className="rating-number">({product.rating})</span>
                    <span className="reviews-count">{product.reviews} reviews</span>
                  </div>
                  
                  <div className="price-section">
                    <span className="current-price">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">₹{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="product-actions">
                    <button className="btn-favorite">♡</button>
                    <button className="btn-primary">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="load-more-section">
            <button className="load-more-btn">Load More Products</button>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="trust-section">
        <h2>Why Choose Our Marketplace?</h2>
        <div className="trust-features">
          <div className="trust-item">
            <div className="trust-icon">🛡️</div>
            <h4>Student Verified</h4>
            <p>All sellers are verified students from recognized institutions</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <h4>Secure Delivery</h4>
            <p>Safe and timely delivery with tracking support</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">💬</div>
            <h4>Direct Communication</h4>
            <p>Chat directly with creators for custom orders</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🔄</div>
            <h4>Easy Returns</h4>
            <p>Hassle-free returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;