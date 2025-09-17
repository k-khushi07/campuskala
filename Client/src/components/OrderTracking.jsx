<<<<<<< Updated upstream
<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  Navigation,
  Map,
  X
=======
=======
>>>>>>> Stashed changes
import React, { useState, useEffect, useRef } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  User, 
  MessageSquare,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  MapPin,
  Navigation,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  Mail
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
} from 'lucide-react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'

const OrderTracking = ({ orderId, orderData, onUpdate }) => {
  const [trackingUpdates, setTrackingUpdates] = useState([])
  const [loading, setLoading] = useState(true)
=======
=======
>>>>>>> Stashed changes
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { loadGoogleMapsAPI, getCurrentLocation as getCurrentLocationUtil, getAddressFromCoordinates, createMap } from '../services/googleMaps'

const OrderTracking = ({ orderId, orderData, onUpdate }) => {
  const { currentUser } = useAuth()
  const [trackingUpdates, setTrackingUpdates] = useState([])
  const [newUpdate, setNewUpdate] = useState('')
  const [addingUpdate, setAddingUpdate] = useState(false)
  const [showAddUpdate, setShowAddUpdate] = useState(false)
  
  // Map-related state
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const [showMap, setShowMap] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [locationHistory, setLocationHistory] = useState([])
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const [mapRef, setMapRef] = useState(null)
  const [mapInstanceRef, setMapInstanceRef] = useState(null)
  const [directionsServiceRef, setDirectionsServiceRef] = useState(null)
  const [directionsRendererRef, setDirectionsRendererRef] = useState(null)

  // Load Google Maps API
  useEffect(() => {
    if (showMap && !window.google) {
      loadGoogleMapsAPI()
    }
  }, [showMap])

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (showMap && window.google && mapRef) {
      initializeMap()
    }
  }, [showMap, mapRef])

  // Fetch tracking updates
=======
=======
>>>>>>> Stashed changes
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const directionsServiceRef = useRef(null)
  const directionsRendererRef = useRef(null)

  // Initialize Google Maps
  useEffect(() => {
    if (showMap && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [showMap])

  // Real-time tracking updates
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  useEffect(() => {
    if (!orderId) return

    const q = query(
      collection(db, 'orderTracking'),
      where('orderId', '==', orderId),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTrackingUpdates(updates)
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      setLoading(false)

      // Extract location data for map
      const locationUpdates = updates.filter(update => update.type === 'location_update')
      setLocationHistory(locationUpdates)

      // Set delivery location from order data
      if (orderData?.deliveryAddress && !deliveryLocation) {
        setDeliveryLocation(orderData.deliveryAddress)
      }
    })

    return () => unsubscribe()
  }, [orderId, orderData])

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve(window.google)
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error("VITE_GOOGLE_MAPS_API_KEY is not defined in your .env file.")
        reject(new Error("Google Maps API key is missing."))
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      window.initMap = () => {
        resolve(window.google)
      }

      script.onerror = (error) => {
        console.error("Google Maps script failed to load:", error)
        reject(new Error("Failed to load Google Maps API."))
      }
    })
  }

  const initializeMap = () => {
    if (!window.google || !mapRef) return

    setMapLoading(true)
    try {
      const map = new window.google.maps.Map(mapRef, {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      setMapInstanceRef(map)

      // Initialize directions service
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false
      })

      setDirectionsServiceRef(directionsService)
      setDirectionsRendererRef(directionsRenderer)

      // Add markers for location history
      locationHistory.forEach((update, index) => {
        if (update.latitude && update.longitude) {
          new window.google.maps.Marker({
            position: { lat: update.latitude, lng: update.longitude },
            map: map,
            title: `Update ${index + 1}: ${update.message}`,
            label: `${index + 1}`
          })
        }
      })

      setMapLoading(false)
    } catch (error) {
      console.error('Error initializing map:', error)
=======
=======
>>>>>>> Stashed changes
      
      // Extract location data from updates
      const locations = updates
        .filter(update => update.location)
        .map(update => ({
          ...update.location,
          timestamp: update.timestamp,
          message: update.message
        }))
      setLocationHistory(locations)
    })

    return () => unsubscribe()
  }, [orderId])

  // Initialize Google Maps
  const initializeMap = async () => {
    setMapLoading(true)
    
    try {
      // Load Google Maps API
      await loadGoogleMapsAPI()
      
      // Create map instance
      mapInstanceRef.current = createMap(mapRef.current, {
        zoom: 12,
        center: { lat: 28.6139, lng: 77.2090 } // Delhi, India
      })

      // Initialize directions service
      directionsServiceRef.current = new window.google.maps.DirectionsService()
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false
      })
      directionsRendererRef.current.setMap(mapInstanceRef.current)

      // Get user's current location
      try {
        const userLocation = await getCurrentLocationUtil()
        setCurrentLocation(userLocation)
        mapInstanceRef.current.setCenter(userLocation)
      } catch (error) {
        console.error('Error getting location:', error)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    } finally {
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      setMapLoading(false)
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)
        addLocationUpdate(location)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Error getting your location: ' + error.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const addLocationUpdate = async (location) => {
    try {
      const address = await getAddressFromCoords(location.lat, location.lng)
      
      const updateData = {
        orderId,
        type: 'location_update',
        message: `Location update: ${address}`,
        latitude: location.lat,
        longitude: location.lng,
        address: address,
        timestamp: serverTimestamp(),
        updatedBy: 'system'
=======
=======
>>>>>>> Stashed changes
  // Get current location
  const getCurrentLocation = async () => {
    try {
      const location = await getCurrentLocationUtil()
      setCurrentLocation(location)
      
      // Add location update to tracking
      addLocationUpdate(location, 'Location updated')
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Unable to get your location. Please check your browser settings.')
    }
  }

  // Add location update to tracking
  const addLocationUpdate = async (location, message) => {
    if (!currentUser || !orderId) return

    try {
      const updateData = {
        orderId: orderId,
        message: message,
        status: getCurrentStatus(),
        timestamp: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByName: currentUser.displayName || currentUser.email,
        type: 'location_update',
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          address: await getAddressFromCoords(location.lat, location.lng)
        }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      }

      await addDoc(collection(db, 'orderTracking'), updateData)
    } catch (error) {
      console.error('Error adding location update:', error)
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const getAddressFromCoords = async (lat, lng) => {
    if (!window.google) return 'Address not available'

    const geocoder = new window.google.maps.Geocoder()
    const latlng = { lat, lng }

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          resolve('Address not available')
        }
      })
    })
  }

  const showRoute = () => {
    if (!mapInstanceRef || !directionsServiceRef || !directionsRendererRef) return

    const latestLocation = locationHistory[0]
    if (!latestLocation || !deliveryLocation) return

    const request = {
      origin: { lat: latestLocation.latitude, lng: latestLocation.longitude },
      destination: deliveryLocation,
      travelMode: window.google.maps.TravelMode.DRIVING
    }

    directionsServiceRef.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.setDirections(result)
        directionsRendererRef.setMap(mapInstanceRef)
      } else {
        console.error('Directions request failed due to ' + status)
      }
    })
  }

  const getStatusIcon = (type) => {
    switch (type) {
      case 'created':
        return <Package size={16} />
      case 'approved':
        return <CheckCircle size={16} />
      case 'shipped':
        return <Truck size={16} />
      case 'delivered':
        return <CheckCircle size={16} />
      case 'location_update':
        return <MapPin size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const getStatusColor = (type) => {
    switch (type) {
      case 'created':
        return 'text-blue-600'
      case 'approved':
        return 'text-green-600'
      case 'shipped':
        return 'text-purple-600'
      case 'delivered':
        return 'text-green-600'
      case 'location_update':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
=======
=======
>>>>>>> Stashed changes
  // Get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      return await getAddressFromCoordinates(lat, lng)
    } catch (error) {
      console.error('Error getting address:', error)
      return 'Address not available'
    }
  }

  // Show route on map
  const showRoute = () => {
    if (!mapInstanceRef.current || !directionsServiceRef.current || !directionsRendererRef.current) return

    if (currentLocation && deliveryLocation) {
      const request = {
        origin: currentLocation,
        destination: deliveryLocation,
        travelMode: window.google.maps.TravelMode.DRIVING
      }

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result)
        } else {
          console.error('Directions request failed:', status)
        }
      })
    }
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return

    setAddingUpdate(true)
    try {
      const updateData = {
        orderId: orderId,
        message: newUpdate.trim(),
        status: getCurrentStatus(),
        timestamp: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByName: currentUser.displayName || currentUser.email,
        type: 'manual_update'
      }

      await addDoc(collection(db, 'orderTracking'), updateData)

      // Update order with latest status
      if (onUpdate) {
        onUpdate(getCurrentStatus())
      }

      setNewUpdate('')
      setShowAddUpdate(false)
    } catch (error) {
      console.error('Error adding tracking update:', error)
      alert('Failed to add update. Please try again.')
    } finally {
      setAddingUpdate(false)
    }
  }

  const getCurrentStatus = () => {
    if (!orderData) return 'unknown'
    return orderData.status || 'pending'
  }

  const getStatusIcon = (status, type) => {
    if (type === 'location_update') {
      return <MapPin className="text-blue-500" size={20} />
    }
    
    switch (status) {
      case 'created':
      case 'open_for_proposals':
        return <FileText className="text-blue-500" size={20} />
      case 'pending_approval':
        return <Clock className="text-yellow-500" size={20} />
      case 'in_progress':
        return <Package className="text-purple-500" size={20} />
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'cancelled':
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <AlertCircle className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
      case 'open_for_proposals':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Map size={16} />
          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
        </button>
      </div>

      {/* Map Container */}
      {showMap && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Location Tracking</h4>
              <div className="flex space-x-2">
                <button
                  onClick={getCurrentLocation}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Get Current Location
                </button>
                {locationHistory.length > 0 && deliveryLocation && (
                  <button
                    onClick={showRoute}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                  >
=======
=======
>>>>>>> Stashed changes
  const canAddUpdate = () => {
    if (!currentUser) return false
    if (!orderData) return false
    
    // Only buyer, seller, or admin can add updates
    return orderData.buyerId === currentUser.uid || 
           orderData.sellerId === currentUser.uid ||
           currentUser.role === 'admin'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-md transition-colors text-sm flex items-center ${
              showMap 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showMap ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          {canAddUpdate() && (
            <button
              onClick={() => setShowAddUpdate(!showAddUpdate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <MessageSquare size={16} className="inline mr-1" />
              Add Update
            </button>
          )}
        </div>
      </div>

      {/* Map Section */}
      {showMap && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                <MapPin size={20} className="mr-2 text-blue-600" />
                Live Location Tracking
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={getCurrentLocation}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Update Location
                </button>
                {currentLocation && deliveryLocation && (
                  <button
                    onClick={showRoute}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <Navigation size={14} className="mr-1" />
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                    Show Route
                  </button>
                )}
              </div>
            </div>
            
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            <div 
              ref={setMapRef}
              className="w-full h-64 bg-gray-100 rounded-lg"
              style={{ minHeight: '256px' }}
            >
              {mapLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          {currentLocation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Current Location</h5>
              <p className="text-sm text-blue-700">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Location History */}
          {locationHistory.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Location History</h5>
              <div className="space-y-2">
                {locationHistory.slice(0, 5).map((update, index) => (
                  <div key={update.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <MapPin size={14} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{update.address || 'Location update'}</p>
                      <p className="text-xs text-gray-500">{formatDate(update.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
=======
=======
>>>>>>> Stashed changes
            {/* Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {currentLocation && (
                <div className="bg-white p-3 rounded-md border">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Current Location</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                  </p>
                  {currentLocation.accuracy && (
                    <p className="text-xs text-gray-500">Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                  )}
                </div>
              )}
              
              {deliveryLocation && (
                <div className="bg-white p-3 rounded-md border">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Delivery Location</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Lat: {deliveryLocation.lat.toFixed(6)}, Lng: {deliveryLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg border border-gray-200"
                style={{ minHeight: '256px' }}
              />
              {mapLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="flex items-center">
                    <RefreshCw className="animate-spin text-blue-600 mr-2" size={20} />
                    <span className="text-gray-600">Loading map...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Location History */}
            {locationHistory.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Location History</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {locationHistory.slice(0, 5).map((location, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600">{location.message}</p>
                          <p className="text-gray-500">{location.address}</p>
                        </div>
                        <span className="text-gray-400">
                          {formatDate(location.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Update Form */}
      {showAddUpdate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="space-y-3">
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Add a status update or note..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddUpdate}
                disabled={addingUpdate || !newUpdate.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {addingUpdate ? 'Adding...' : 'Add Update'}
              </button>
              <button
                onClick={() => {
                  setShowAddUpdate(false)
                  setNewUpdate('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        </div>
      )}

      {/* Tracking Timeline */}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Order Progress</h4>
        
        {trackingUpdates.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No tracking updates yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trackingUpdates.map((update, index) => (
              <div key={update.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(update.type)}`}>
                  {getStatusIcon(update.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{update.message}</p>
                    <p className="text-sm text-gray-500">{formatDate(update.timestamp)}</p>
                  </div>
                  {update.type === 'location_update' && update.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      <MapPin size={12} className="inline mr-1" />
                      {update.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
=======
=======
>>>>>>> Stashed changes
      <div className="space-y-4">
        {trackingUpdates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No tracking updates yet</p>
          </div>
        ) : (
          trackingUpdates.map((update, index) => (
            <div key={update.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(update.status, update.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                      {update.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {update.type === 'manual_update' && (
                      <span className="text-xs text-gray-500">Manual Update</span>
                    )}
                    {update.type === 'location_update' && (
                      <span className="text-xs text-blue-600">Location Update</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(update.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{update.message}</p>
                
                {/* Location details for location updates */}
                {update.type === 'location_update' && update.location && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="flex items-center text-xs text-blue-700">
                      <MapPin size={12} className="mr-1" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">{update.location.address}</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Coordinates: {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}
                    </div>
                  </div>
                )}
                
                {update.updatedByName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Updated by {update.updatedByName}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary */}
      {orderData && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400" />
              <span className="text-gray-600">Created:</span>
              <span className="ml-auto font-medium">
                {formatDate(orderData.createdAt)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400" />
              <span className="text-gray-600">Deadline:</span>
              <span className="ml-auto font-medium">
                {formatDate(orderData.deadline)}
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign size={16} className="mr-2 text-gray-400" />
              <span className="text-gray-600">Budget:</span>
              <span className="ml-auto font-medium">
                ₹{orderData.budget || orderData.totalAmount}
              </span>
            </div>
            <div className="flex items-center">
              <User size={16} className="mr-2 text-gray-400" />
              <span className="text-gray-600">Status:</span>
              <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.status)}`}>
                {orderData.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    </div>
  )
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
export default OrderTracking
=======
export default OrderTracking
>>>>>>> Stashed changes
=======
export default OrderTracking
>>>>>>> Stashed changes
