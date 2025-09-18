import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { envStatus } from './utils/envCheck'
import './utils/testNotifications' // Import test utilities
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/navbar'
import Footer from './components/footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/home'
import Products from './pages/products'
import Services from './pages/services'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import Orders from './pages/orders'
import MyOrders from './pages/myOrders'
import SellerCustomOrders from './pages/sellerCustomOrders'
import Profile from './pages/profile'
import Login from './pages/login'
import Register from './pages/register'
import Sell from './pages/sell'
import Wishlist from './pages/wishlist'
import FeaturedCreators from './pages/featuredCreators'
import PaymentSuccess from './pages/paymentSuccess'
import PaymentCancel from './pages/paymentCancel'

function App() {
  // Show environment warning if needed
  if (!envStatus.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Missing required environment variables: {envStatus.missing.join(', ')}
          </p>
          <p className="text-sm text-gray-500">
            Please check your .env file and restart the development server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/seller-orders" 
                element={
                  <ProtectedRoute>
                    <SellerCustomOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sell" 
                element={
                  <ProtectedRoute>
                    <Sell />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-orders" 
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/featured-creators" 
                element={<FeaturedCreators />} 
              />
              <Route 
                path="/payment/success" 
                element={<PaymentSuccess />} 
              />
              <Route 
                path="/payment/cancel" 
                element={<PaymentCancel />} 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App