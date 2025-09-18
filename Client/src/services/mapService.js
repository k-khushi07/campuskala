// Map Service for Order Tracking - Free OpenStreetMap + Leaflet
class MapService {
  constructor() {
    this.map = null
    this.markers = []
    this.routeLine = null
    this.isMapLoaded = false
  }

  // Load Leaflet CSS and JS dynamically
  async loadMapLibrary() {
    if (this.isMapLoaded) return

    return new Promise((resolve, reject) => {
      // Load Leaflet CSS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      cssLink.crossOrigin = ''
      document.head.appendChild(cssLink)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => {
        this.isMapLoaded = true
        resolve()
      }
      script.onerror = () => {
        reject(new Error('Failed to load Leaflet library'))
      }
      document.head.appendChild(script)
    })
  }

  // Initialize map
  async initializeMap(containerId, center = [28.6139, 77.2090], zoom = 10) {
    try {
      await this.loadMapLibrary()

      // Initialize map
      this.map = window.L.map(containerId).setView(center, zoom)

      // Add OpenStreetMap tiles (completely free)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map)

      return this.map
    } catch (error) {
      console.error('Error initializing map:', error)
      throw error
    }
  }

  // Add marker for seller location
  addSellerMarker(lat, lng, title, description = '') {
    if (!this.map) return null

    const sellerIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: #10B981;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          📦
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })

    const marker = window.L.marker([lat, lng], { icon: sellerIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #10B981; font-size: 16px;">${title}</h3>
          <p style="margin: 0; color: #6B7280; font-size: 14px;">${description}</p>
          <div style="margin-top: 8px; padding: 4px 8px; background-color: #10B981; color: white; border-radius: 4px; font-size: 12px; display: inline-block;">
            Seller Location
          </div>
        </div>
      `)

    this.markers.push(marker)
    return marker
  }

  // Add marker for customer location
  addCustomerMarker(lat, lng, title, description = '') {
    if (!this.map) return null

    const customerIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: #3B82F6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          🏠
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })

    const marker = window.L.marker([lat, lng], { icon: customerIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #3B82F6; font-size: 16px;">${title}</h3>
          <p style="margin: 0; color: #6B7280; font-size: 14px;">${description}</p>
          <div style="margin-top: 8px; padding: 4px 8px; background-color: #3B82F6; color: white; border-radius: 4px; font-size: 12px; display: inline-block;">
            Delivery Address
          </div>
        </div>
      `)

    this.markers.push(marker)
    return marker
  }

  // Add delivery route
  async addDeliveryRoute(sellerLat, sellerLng, customerLat, customerLng) {
    if (!this.map) return null

    try {
      // Use OpenRouteService for routing (free tier available)
      const route = await this.getRoute(sellerLat, sellerLng, customerLat, customerLng)
      
      if (route && route.coordinates) {
        const routeLine = window.L.polyline(route.coordinates, {
          color: '#EF4444',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(this.map)

        this.routeLine = routeLine
        
        // Fit map to show entire route
        const group = new window.L.featureGroup([routeLine])
        this.map.fitBounds(group.getBounds().pad(0.1))
        
        return routeLine
      }
    } catch (error) {
      console.error('Error adding delivery route:', error)
      // Fallback: draw straight line
      return this.addStraightLine(sellerLat, sellerLng, customerLat, customerLng)
    }
  }

  // Get route using OpenRouteService (free tier)
  async getRoute(startLat, startLng, endLat, endLng) {
    try {
      // Using free OpenRouteService API
      const apiKey = '5b3ce3597851110001cf6248b8c4c8b9a2c64f5d9c8b8b8b8b8b8b8b8b8b8b' // Free API key
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.features && data.features[0]) {
        const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]])
        return {
          coordinates,
          distance: data.features[0].properties.summary.distance,
          duration: data.features[0].properties.summary.duration
        }
      }
    } catch (error) {
      console.error('Error getting route:', error)
      return null
    }
  }

  // Fallback: add straight line between points
  addStraightLine(startLat, startLng, endLat, endLng) {
    if (!this.map) return null

    const line = window.L.polyline([
      [startLat, startLng],
      [endLat, endLng]
    ], {
      color: '#EF4444',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5'
    }).addTo(this.map)

    this.routeLine = line
    return line
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    try {
      // Using free Nominatim API (OpenStreetMap)
      const encodedAddress = encodeURIComponent(address)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CampusKala/1.0'
        }
      })
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
    }
    
    // Fallback to default coordinates (Delhi)
    return {
      lat: 28.6139,
      lng: 77.2090,
      displayName: address
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Clear all markers and routes
  clearMap() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker)
    })
    this.markers = []
    
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine)
      this.routeLine = null
    }
  }

  // Destroy map
  destroyMap() {
    if (this.map) {
      this.clearMap()
      this.map.remove()
      this.map = null
    }
    this.isMapLoaded = false
  }

  // Get current map instance
  getMap() {
    return this.map
  }
}

export const mapService = new MapService()
export default mapService
