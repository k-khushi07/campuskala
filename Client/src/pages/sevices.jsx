import React, { useState } from 'react';
import './services.css';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [serviceType, setServiceType] = useState('all');

  // Sample services data
  const services = [
    {
      id: 1,
      title: "I will create a professional website design",
      price: 1500,
      deliveryTime: "3 days",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 156,
      seller: {
        name: "RahulDesigns",
        level: "Level 2 Seller",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "design",
      serviceType: "fixed",
      tags: ["web design", "ui/ux", "responsive"],
      featured: true,
      orders: 234
    },
    {
      id: 2,
      title: "I will write SEO optimized blog articles",
      price: 500,
      deliveryTime: "2 days",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 89,
      seller: {
        name: "ContentByPriya",
        level: "Level 1 Seller",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "writing",
      serviceType: "fixed",
      tags: ["content writing", "seo", "blog"],
      featured: false,
      orders: 145
    },
    {
      id: 3,
      title: "I will provide math tutoring sessions",
      price: 800,
      priceType: "per hour",
      deliveryTime: "Same day",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 67,
      seller: {
        name: "MathGuru2024",
        level: "Top Rated",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "tutoring",
      serviceType: "hourly",
      tags: ["mathematics", "tutoring", "calculus"],
      featured: true,
      orders: 89
    },
    {
      id: 4,
      title: "I will develop a mobile app prototype",
      price: 3500,
      deliveryTime: "7 days",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 34,
      seller: {
        name: "AppDev_Student",
        level: "Level 2 Seller",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "programming",
      serviceType: "fixed",
      tags: ["app development", "prototype", "flutter"],
      featured: false,
      orders: 78
    },
    {
      id: 5,
      title: "I will create custom illustrations",
      price: 1200,
      deliveryTime: "4 days",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 156,
      seller: {
        name: "ArtByAisha",
        level: "Level 3 Seller",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "design",
      serviceType: "fixed",
      tags: ["illustration", "digital art", "custom"],
      featured: true,
      orders: 267
    },
    {
      id: 6,
      title: "I will help with data analysis projects",
      price: 2000,
      deliveryTime: "5 days",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 43,
      seller: {
        name: "DataScience_Pro",
        level: "Top Rated",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      category: "data",
      serviceType: "fixed",
      tags: ["data analysis", "python", "visualization"],
      featured: true,
      orders: 123
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services', icon: '🎯', count: services.length },
    { id: 'design', name: 'Design & Creative', icon: '🎨', count: services.filter(s => s.category === 'design').length },
    { id: 'writing', name: 'Writing & Content', icon: '✍️', count: services.filter(s => s.category === 'writing').length },
    { id: 'programming', name: 'Programming & Tech', icon: '💻', count: services.filter(s => s.category === 'programming').length },
    { id: 'tutoring', name: 'Tutoring & Education', icon: '📚', count: services.filter(s => s.category === 'tutoring').length },
    { id: 'data', name: 'Data & Analytics', icon: '📊', count: services.filter(s => s.category === 'data').length }
  ];

  const filteredServices = services.filter(service => {
    if (selectedCategory !== 'all' && service.category !== selectedCategory) return false;
    if (service.price < priceRange[0] || service.price > priceRange[1]) return false;
    if (serviceType !== 'all' && service.serviceType !== serviceType) return false;
    return true;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'reviews': return b.reviews - a.reviews;
      case 'orders': return b.orders - a.orders;
      default: return b.featured - a.featured;
    }
  });

  return (
    <div className="services-container">
      {/* Hero Section */}
      <div className="services-hero">
        <div className="hero-content">
          <h1>Find Student Services</h1>
          <p>Connect with talented student freelancers for your next project</p>
          <div className="hero-search">
            <input 
              type="text" 
              placeholder="Search for any service..." 
              className="search-input"
            />
            <button className="search-btn">Search</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Active Services</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Student Freelancers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Client Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <div className="category-info">
                <h3>{category.name}</h3>
                <span className="service-count">{category.count} services</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="services-layout">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Service Type</h3>
            <div className="service-type-filters">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="serviceType" 
                  value="all" 
                  checked={serviceType === 'all'}
                  onChange={(e) => setServiceType(e.target.value)}
                />
                All Types
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="serviceType" 
                  value="fixed" 
                  checked={serviceType === 'fixed'}
                  onChange={(e) => setServiceType(e.target.value)}
                />
                Fixed Price
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="serviceType" 
                  value="hourly" 
                  checked={serviceType === 'hourly'}
                  onChange={(e) => setServiceType(e.target.value)}
                />
                Hourly Rate
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Budget Range</h3>
            <div className="price-filter">
              <input
                type="range"
                min="0"
                max="5000"
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
            <h3>Seller Level</h3>
            <div className="checkbox-filters">
              <label><input type="checkbox" /> Top Rated Seller</label>
              <label><input type="checkbox" /> Level 2+ Seller</label>
              <label><input type="checkbox" /> New Seller</label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Delivery Time</h3>
            <div className="checkbox-filters">
              <label><input type="checkbox" /> Express (24hrs)</label>
              <label><input type="checkbox" /> Up to 3 days</label>
              <label><input type="checkbox" /> Up to 7 days</label>
            </div>
          </div>
        </div>

        {/* Services Main Content */}
        <div className="services-main">
          {/* Sort Bar */}
          <div className="sort-bar">
            <div className="results-info">
              <span className="results-count">{sortedServices.length} services available</span>
              {selectedCategory !== 'all' && (
                <span className="active-filter">in {categories.find(c => c.id === selectedCategory)?.name}</span>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Best Rating</option>
              <option value="orders">Best Selling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {sortedServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                  {service.featured && <span className="featured-badge">Featured</span>}
                  <div className="service-overlay">
                    <button className="contact-btn">Contact Seller</button>
                  </div>
                </div>

                <div className="service-content">
                  <div className="seller-info">
                    <img src={service.seller.avatar} alt={service.seller.name} className="seller-avatar" />
                    <div className="seller-details">
                      <span className="seller-name">{service.seller.name}</span>
                      <span className="seller-level">{service.seller.level}</span>
                    </div>
                    {service.seller.verified && <div className="verified-badge">✓</div>}
                  </div>

                  <h3 className="service-title">{service.title}</h3>

                  <div className="service-tags">
                    {service.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="service-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="service-stats">
                    <div className="rating">
                      <span className="stars">★</span>
                      <span className="rating-number">{service.rating}</span>
                      <span className="reviews-count">({service.reviews})</span>
                    </div>
                    <span className="orders-count">{service.orders} orders</span>
                  </div>

                  <div className="service-footer">
                    <div className="delivery-info">
                      <span className="delivery-icon">⚡</span>
                      <span className="delivery-time">{service.deliveryTime}</span>
                    </div>
                    <div className="price-info">
                      <span className="price-label">Starting at</span>
                      <span className="price">₹{service.price}</span>
                      {service.priceType && <span className="price-type">/{service.priceType}</span>}
                    </div>
                  </div>

                  <button className="service-cta">View Details</button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="load-more-section">
            <button className="load-more-btn">Show More Services</button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2>How CampusKala Works</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <h4>Browse Services</h4>
            <p>Explore services from verified student freelancers across various categories</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h4>Choose & Contact</h4>
            <p>Select the perfect service and communicate directly with the seller</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h4>Place Order</h4>
            <p>Secure payment process with milestone-based payments for larger projects</p>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <h4>Get Results</h4>
            <p>Receive high-quality work on time with revision options included</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Project?</h2>
          <p>Join thousands of satisfied clients who found the perfect freelancer</p>
          <div className="cta-buttons">
            <button className="btn-primary">Post a Project</button>
            <button className="btn-secondary">Become a Seller</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;