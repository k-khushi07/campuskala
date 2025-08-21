import React from 'react'

const Products = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Products Page
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page will display all products with advanced filtering and sorting options.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-500">
              Coming soon - Full products catalog with search, filters, and categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products