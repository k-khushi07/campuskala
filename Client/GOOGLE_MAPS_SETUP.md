# Google Maps API Setup for Order Tracking

This guide will help you set up Google Maps API for the order tracking feature.

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

## 2. Configure Environment Variables

Create a `.env` file in the Client directory with the following content:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Replace `your_google_maps_api_key_here` with your actual API key.

## 3. API Key Restrictions (Recommended)

For security, restrict your API key:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain(s):
   - `localhost:*` (for development)
   - `yourdomain.com/*` (for production)
5. Under "API restrictions", select "Restrict key"
6. Choose the APIs you enabled in step 1

## 4. Features Available

With Google Maps integration, you get:

- **Real-time Location Tracking**: Track order delivery in real-time
- **Interactive Map**: Visual representation of delivery progress
- **Route Planning**: Show optimal routes between locations
- **Address Geocoding**: Convert coordinates to readable addresses
- **Location History**: Track location updates over time
- **Distance Calculation**: Calculate distances between points

## 5. Usage

The map will automatically load when users click "Show Map" in the order tracking section. Users can:

- View their current location
- See delivery routes
- Track location history
- Update their location manually

## 6. Troubleshooting

### Map not loading
- Check if your API key is correct
- Verify the API key has the required permissions
- Check browser console for errors

### Location not working
- Ensure HTTPS is enabled (required for geolocation)
- Check if user has granted location permissions
- Verify browser supports geolocation

### API quota exceeded
- Check your Google Cloud Console for usage
- Consider implementing caching for repeated requests
- Monitor your API usage regularly

## 7. Cost Considerations

Google Maps API has usage-based pricing:
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests
- Directions API: $5 per 1,000 requests

Monitor your usage in Google Cloud Console to avoid unexpected charges.

## 8. Alternative Solutions

If you prefer not to use Google Maps, you can:
- Use OpenStreetMap with Leaflet
- Use Mapbox API
- Use Here Maps API
- Implement a simple coordinate display without maps

For any issues, check the browser console for error messages and refer to the Google Maps API documentation.
