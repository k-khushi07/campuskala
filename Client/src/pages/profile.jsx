// src/pages/Profile.jsx
import React from 'react'

const Profile = () => { 
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            User Profile
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your profile, orders, and account settings.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-500">
              Coming soon - User profile with order history and settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile