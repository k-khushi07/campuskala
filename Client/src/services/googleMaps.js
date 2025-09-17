// Google Maps API configuration and utilities

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

// Load Google Maps API
export const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      resolve(window.google.maps)
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'))
    }
    
    document.head.appendChild(script)
  })
}

// Get current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Get address from coordinates
export const getAddressFromCoordinates = async (lat, lng) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const geocoder = new window.google.maps.Geocoder()
  const latlng = { lat, lng }
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address)
      } else {
        reject(new Error('Geocoding failed'))
      }
    })
  })
}

// Calculate distance between two points
export const calculateDistance = (point1, point2) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const R = 6371 // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLng = (point2.lng - point1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c

  return distance
}

// Get directions between two points
export const getDirections = (origin, destination, travelMode = 'DRIVING') => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const directionsService = new window.google.maps.DirectionsService()
  
  return new Promise((resolve, reject) => {
    const request = {
      origin: origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode[travelMode]
    }

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        resolve(result)
      } else {
        reject(new Error(`Directions request failed: ${status}`))
      }
    })
  })
}

// Create a map instance
export const createMap = (element, options = {}) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const defaultOptions = {
    zoom: 12,
    center: { lat: 28.6139, lng: 77.2090 }, // Delhi, India
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }

  return new window.google.maps.Map(element, { ...defaultOptions, ...options })
}

// Add marker to map
export const addMarker = (map, position, options = {}) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const defaultOptions = {
    position: position,
    map: map,
    title: 'Location'
  }

  return new window.google.maps.Marker({ ...defaultOptions, ...options })
}

// Add info window to marker
export const addInfoWindow = (marker, content) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  const infoWindow = new window.google.maps.InfoWindow({
    content: content
  })

  marker.addListener('click', () => {
    infoWindow.open(marker.getMap(), marker)
  })

  return infoWindow
}

export default {
  loadGoogleMapsAPI,
  getCurrentLocation,
  getAddressFromCoordinates,
  calculateDistance,
  getDirections,
  createMap,
  addMarker,
  addInfoWindow
}
