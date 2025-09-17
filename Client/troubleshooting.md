# Troubleshooting Guide

## "Refresh Page" Error

If you're seeing a "refresh page" message when navigating, here are the most common causes and solutions:

### 1. Environment Variables Missing
**Problem**: Missing required environment variables
**Solution**: 
- Create a `.env` file in the Client directory
- Add your Firebase configuration
- Restart the development server

### 2. JavaScript Errors
**Problem**: Uncaught JavaScript errors causing the app to crash
**Solution**:
- Open browser developer tools (F12)
- Check the Console tab for error messages
- Look for red error messages and fix them

### 3. Firebase Configuration Issues
**Problem**: Firebase not properly initialized
**Solution**:
- Verify your Firebase project ID is correct
- Check if Firebase services are enabled in Firebase Console
- Ensure you're using the correct API keys

### 4. Network Issues
**Problem**: Cannot connect to Firebase services
**Solution**:
- Check your internet connection
- Verify Firebase services are not blocked by firewall
- Try using Firebase emulators for offline development

## Quick Fixes

### Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Clear Browser Cache
- Press Ctrl+Shift+R (hard refresh)
- Or clear browser cache and cookies

### Check Browser Console
1. Press F12 to open developer tools
2. Go to Console tab
3. Look for any red error messages
4. Take a screenshot of errors and share for help

### Test Firebase Connection
```bash
# Start Firebase emulators
npm run emulators

# In another terminal, start frontend
npm run dev
```

## Common Error Messages

### "Firebase: Error (auth/network-request-failed)"
- Check internet connection
- Verify Firebase project configuration

### "Stripe failed to load"
- Add your Stripe publishable key to .env file
- This is optional for basic functionality

### "Missing required environment variables"
- Create .env file with Firebase configuration
- Restart development server

## Getting Help

1. **Check the console** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test with emulators** to isolate issues
4. **Share error messages** for specific help

## Environment Variables Template

Create a `.env` file in the Client directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```
