import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/home'
import Products from './pages/products'
import Services from './pages/services'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import CustomOrder from './pages/customOrder'
import Profile from './pages/profile'
import Login from './pages/login'
import Register from './pages/register'

function App() {
  return (
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
            path="/custom-order" 
            element={
              <ProtectedRoute>
                <CustomOrder />
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
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App