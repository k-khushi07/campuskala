# Razorpay Payment Integration Setup Guide

## Overview
This guide will help you set up Razorpay payment integration for CampusKala, which is much more user-friendly for Indian users than Stripe.

## Prerequisites
- Razorpay account (free to start)
- Node.js and npm installed
- Firebase project

## Step 1: Razorpay Account Setup

### 1.1 Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a free account
3. Complete KYC verification

### 1.2 Get API Keys
1. In Razorpay Dashboard, go to **Settings > API Keys**
2. Copy your **Key ID** (starts with `rzp_test_` for test mode)
3. Copy your **Key Secret** (starts with `rzp_test_` for test mode)

## Step 2: Client-Side Configuration

### 2.1 Environment Variables
Create a `.env` file in the Client directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
```

### 2.2 Install Razorpay Dependencies
```bash
npm install razorpay
```

## Step 3: Payment Methods Supported

### 3.1 Cash on Delivery (COD)
- No payment processing required
- Order placed directly in Firebase
- Payment collected on delivery

### 3.2 Card Payments
- Credit/Debit Cards (Visa, Mastercard, RuPay)
- Processed through Razorpay
- Secure payment gateway

### 3.3 UPI Payments
- Google Pay, PhonePe, Paytm, BHIM
- Processed through Razorpay
- Quick and easy payments

## Step 4: Testing

### 4.1 Test Cards (Test Mode)
Use these test card numbers:
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **RuPay**: 6521 6521 6521 6521
- **Declined**: 4000 0000 0000 0002

Use any future expiry date and any 3-digit CVV.

### 4.2 Test UPI
- Use any valid UPI ID for testing
- Test UPI ID: `success@razorpay`

### 4.3 Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Select payment method
5. Use test card details or UPI
6. Complete payment

## Step 5: Production Setup

### 5.1 Switch to Live Mode
1. In Razorpay Dashboard, complete KYC
2. Get live API keys
3. Update environment variables with live keys

### 5.2 Update Environment Variables
```env
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

## Step 6: Payment Flow

### 6.1 Cash on Delivery
1. User selects COD
2. Order created in Firebase
3. Sellers notified
4. Payment collected on delivery

### 6.2 Online Payments
1. User selects Card/UPI
2. Razorpay checkout opens
3. User completes payment
4. Payment verified
5. Order created in Firebase
6. Sellers notified

## Step 7: Security Features

### 7.1 Razorpay Security
- PCI DSS compliant
- 256-bit SSL encryption
- Fraud detection
- 3D Secure authentication

### 7.2 Firebase Security
- User authentication required
- Server-side order processing
- Secure data storage

## Step 8: Cost Structure

### 8.1 Razorpay Fees
- **Cards**: 2% + ₹2 per transaction
- **UPI**: 2% + ₹2 per transaction
- **Net Banking**: 2% + ₹2 per transaction
- **Wallets**: 2% + ₹2 per transaction

### 8.2 No Setup Fees
- No monthly fees
- No hidden charges
- Pay only for successful transactions

## Step 9: Benefits of Razorpay

### 9.1 User Experience
- **Familiar Interface**: Indian users are familiar with Razorpay
- **Multiple Options**: Cards, UPI, Net Banking, Wallets
- **Quick Payments**: Fast processing
- **Mobile Optimized**: Great mobile experience

### 9.2 Developer Experience
- **Easy Integration**: Simple API
- **Good Documentation**: Comprehensive docs
- **Test Mode**: Easy testing
- **Webhooks**: Real-time updates

### 9.3 Business Benefits
- **Higher Conversion**: Better payment success rates
- **Lower Fees**: Competitive pricing
- **Indian Focus**: Designed for Indian market
- **Reliable**: 99.9% uptime

## Step 10: Troubleshooting

### Common Issues

1. **"Razorpay not loaded" error**
   - Check internet connection
   - Ensure Razorpay script loads properly

2. **Payment failed**
   - Check card details
   - Ensure sufficient funds
   - Try different payment method

3. **Order not created after payment**
   - Check Firebase connection
   - Verify order service
   - Check console for errors

### Getting Help
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Step 11: Next Steps

1. **Set up webhooks**: For real-time payment updates
2. **Add refunds**: Implement refund functionality
3. **Analytics**: Track payment success rates
4. **Mobile app**: Integrate with mobile app
5. **Subscriptions**: Add recurring payments if needed

## Step 12: Environment Variables Template

Create a `.env` file with these variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here

# App Configuration
VITE_APP_NAME=CampusKala
VITE_APP_VERSION=1.0.0
```

## Summary

Razorpay integration provides:
- ✅ Better user experience for Indian users
- ✅ Multiple payment methods
- ✅ Lower fees than international gateways
- ✅ Easy integration
- ✅ Reliable service
- ✅ Mobile-optimized checkout

This makes it the perfect choice for CampusKala's payment processing needs!
