import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Clock, Package, Truck, User } from 'lucide-react'
import mapService from '../services/mapService'

const OrderTrackingMap = ({ order, isVisible = true }) => {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [sellerLocation, setSellerLocation] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isVisible && order && mapRef.current) {
      initializeMap()
    }
  }, [isVisible, order])

  const initializeMap = async () => {
    try {
      setLoading(true)
      
      // Initialize map
      await mapService.initializeMap(mapRef.current.id)
      setMapLoaded(true)

      // Geocode seller location (you might have seller's address in order data)
      const sellerCoords = await mapService.geocodeAddress(
        order.sellerAddress || 'Delhi, India' // Fallback to Delhi
      )
      setSellerLocation(sellerCoords)

      // Geocode customer delivery address
      const customerCoords = await mapService.geocodeAddress(
        order.deliveryAddress || order.address
      )
      setCustomerLocation(customerCoords)

      // Add markers
      mapService.addSellerMarker(
        sellerCoords.lat,
        sellerCoords.lng,
        order.sellerName || 'Seller',
        order.sellerAddress || 'Seller Location'
      )

      mapService.addCustomerMarker(
        customerCoords.lat,
        customerCoords.lng,
        order.buyerName || 'Customer',
        order.deliveryAddress || order.address
      )

      // Add delivery route
      const route = await mapService.addDeliveryRoute(
        sellerCoords.lat,
        sellerCoords.lng,
        customerCoords.lat,
        customerCoords.lng
      )

      if (route) {
        const distance = mapService.calculateDistance(
          sellerCoords.lat,
          sellerCoords.lng,
          customerCoords.lat,
          customerCoords.lng
        )
        
        setRouteInfo({
          distance: distance.toFixed(1),
          estimatedTime: Math.round(distance * 2.5) // Rough estimate: 2.5 min per km
        })
      }

    } catch (error) {
      console.error('Error initializing map:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval': return <Clock className="w-4 h-4" />
      case 'approved': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <MapPin className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (!isVisible) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Order Tracking</h3>
              <p className="text-sm text-gray-600">Order #{order?.id?.substring(0, 8)}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getOrderStatusColor(order?.status)}`}>
            {getOrderStatusIcon(order?.status)}
            <span className="capitalize">{order?.status?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{order?.buyerName}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{order?.items?.length || 0}</span>
            </div>
          </div>
          <div className="space-y-2">
            {routeInfo && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{routeInfo.distance} km</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Est. Time:</span>
                  <span className="font-medium">{routeInfo.estimatedTime} min</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef}
          id={`order-map-${order?.id}`}
          className="w-full h-80 bg-gray-100"
          style={{ minHeight: '320px' }}
        />
        
        {!mapLoaded && !loading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Map not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Seller Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Delivery Address</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2"></div>
            <span className="text-gray-600">Delivery Route</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTrackingMap
