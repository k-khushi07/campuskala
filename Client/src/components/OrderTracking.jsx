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
} from 'lucide-react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'

const OrderTracking = ({ orderId, orderData, onUpdate }) => {
  const [trackingUpdates, setTrackingUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [locationHistory, setLocationHistory] = useState([])
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
      setMapLoading(false)
    }
  }

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
      }

      await addDoc(collection(db, 'orderTracking'), updateData)
    } catch (error) {
      console.error('Error adding location update:', error)
    }
  }

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
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

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
                    Show Route
                  </button>
                )}
              </div>
            </div>
            
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
        </div>
      )}

      {/* Tracking Timeline */}
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
    </div>
  )
}

export default OrderTracking