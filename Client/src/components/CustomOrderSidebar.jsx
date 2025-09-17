import React, { useState } from 'react'
import { 
  Menu, 
  X, 
  Plus, 
  Package, 
  Users, 
  MessageSquare, 
  Settings,
  Bell,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CustomOrderSidebar = ({ activeTab, setActiveTab, onClose }) => {
  const { currentUser, userProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      id: 'create',
      label: 'Create Order',
      icon: Plus,
      description: 'Post a new custom order request'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      description: 'View and manage your orders'
    },
    {
      id: 'browse',
      label: 'Browse Orders',
      icon: Users,
      description: 'Find orders to work on'
    },
    {
      id: 'proposals',
      label: 'My Proposals',
      icon: MessageSquare,
      description: 'Track your submitted proposals'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'View order updates and messages'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View your order statistics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Customize your preferences'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help with custom orders'
    }
  ]

  const handleItemClick = (itemId) => {
    setActiveTab(itemId)
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
      >
        <Menu size={24} className="text-gray-600" />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Custom Orders</h2>
              <p className="text-sm text-gray-600">Marketplace & Management</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {userProfile?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {userProfile?.displayName || 'User'}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Custom Orders v1.0</p>
              <p className="mt-1">Real-time tracking & management</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomOrderSidebar
