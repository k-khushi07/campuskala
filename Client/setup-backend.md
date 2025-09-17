# Backend Setup Guide for CampusKala

## Prerequisites
1. Node.js (v18 or higher)
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Stripe account with API keys

## Setup Steps

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Environment Variables
Create a `.env` file in the Client directory with your actual values:

```env
# Firebase Configuration (already configured)
VITE_FIREBASE_API_KEY=AIzaSyDvEaxuzbuHH_10zlwxk_aHpJO0PnysWTE
VITE_FIREBASE_AUTH_DOMAIN=campus-kala-e1240.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=campus-kala-e1240
VITE_FIREBASE_STORAGE_BUCKET=campus-kala-e1240.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=905535340534
VITE_FIREBASE_APP_ID=1:905535340534:web:1c840875c5930db24d11d7
VITE_FIREBASE_MEASUREMENT_ID=G-48NZQZQJRT

# Stripe Configuration (REPLACE WITH YOUR ACTUAL KEYS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here

# Development URLs
VITE_API_BASE_URL=http://localhost:5001/campus-kala-e1240/us-central1
VITE_APP_URL=http://localhost:5173
```

### 3. Firebase Functions Configuration
Set up your Stripe secret key in Firebase Functions:

```bash
# Set Stripe secret key (replace with your actual secret key)
firebase functions:config:set stripe.secret="sk_test_your_actual_stripe_secret_key_here"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
```

### 4. Start Development Environment

#### Option A: Using Firebase Emulators (Recommended for Development)
```bash
# Start Firebase emulators
npm run emulators

# In another terminal, start the frontend
npm run dev
```

#### Option B: Deploy to Firebase (Production)
```bash
# Deploy functions
firebase deploy --only functions

# Deploy hosting
npm run build
firebase deploy --only hosting
```

### 5. Test the Integration

1. **Start the emulators**: `npm run emulators`
2. **Start the frontend**: `npm run dev`
3. **Visit**: http://localhost:5173
4. **Test checkout**: Go to the checkout page and try to create an order

## Available Services

### Payment Service (`src/services/payment.js`)
- `createOrderAndPay()` - Create order and initiate payment
- `processPayment()` - Process payment for existing order
- `handlePaymentSuccess()` - Handle successful payment
- `processRefund()` - Process refunds

### Stripe Service (`src/services/stripe.js`)
- `createPaymentIntent()` - Create Stripe payment intent
- `createCheckoutSession()` - Create Stripe checkout session
- `processRefund()` - Process Stripe refunds

### Order Service (`src/services/orderService.js`)
- `getOrder()` - Get order by ID
- `getUserOrders()` - Get orders for user
- `updateOrderStatus()` - Update order status
- `cancelOrder()` - Cancel order

## Firebase Functions Available

### Payment Functions
- `createPaymentIntent` - Create Stripe payment intent
- `createCheckoutSession` - Create Stripe checkout session
- `processRefund` - Process refunds
- `stripeWebhook` - Handle Stripe webhooks

### Utility Functions
- `sendNotification` - Send notifications
- `cleanupNotifications` - Clean up old notifications

## Database Collections

### Orders Collection
```javascript
{
  userId: string,
  userName: string,
  userEmail: string,
  items: array,
  totalAmount: number,
  shippingAddress: object,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed',
  stripePaymentIntentId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Payments Collection
```javascript
{
  orderId: string,
  userId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  stripePaymentIntentId: string,
  status: string,
  createdAt: timestamp
}
```

## Troubleshooting

### Common Issues

1. **Firebase Functions not working**
   - Make sure Firebase CLI is installed
   - Check if you're logged in: `firebase login`
   - Verify project: `firebase use campus-kala-e1240`

2. **Stripe integration not working**
   - Verify your Stripe keys are correct
   - Check if you're using test keys for development
   - Ensure webhook endpoints are configured

3. **Environment variables not loading**
   - Restart the development server after adding .env
   - Check if variables start with `VITE_`
   - Verify .env file is in the Client directory

### Getting Help
- Check Firebase Console for function logs
- Use browser developer tools for frontend errors
- Check Firebase Emulator UI at http://localhost:4000

## Next Steps

1. **Add Stripe Elements**: Implement proper Stripe Elements for card input
2. **Add Cart Context**: Create a proper cart context for managing items
3. **Add Order History**: Create order history page
4. **Add Admin Panel**: Create admin interface for order management
5. **Add Notifications**: Implement real-time notifications
6. **Add Reviews**: Add product/service review system
