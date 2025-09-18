import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info with SDG */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CK</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CampusKala
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Connecting campus creativity with student needs. Discover unique products, 
              services, and custom creations from talented student creators.
            </p>
            
            {/* SDG Commitment */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full flex items-center">
                🌱 SDG 8: Decent Work
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center">
                ♻️ SDG 12: Responsible Consumption
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/services", label: "Services" },
                { to: "/sell", label: "Become a Seller" }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-300 hover:text-purple-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                { to: "/help", label: "Help Center" },
                { to: "/contact", label: "Contact Us" },
                { to: "/terms", label: "Terms of Service" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/sustainability", label: "Sustainability Report" }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-300 hover:text-purple-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">
              © {new Date().getFullYear()} CampusKala. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-300 text-sm">Empowering Student Creators</span>
              <div className="flex space-x-2">
                <span className="text-yellow-400">🎓</span>
                <span className="text-green-400">🌱</span>
                <span className="text-purple-400">💜</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
