# Stripe Payment Integration Setup Guide

## Overview
This guide will help you set up Stripe payment integration for CampusKala with Firebase Blaze plan.

## Prerequisites
- Firebase project with Blaze plan (pay-as-you-go)
- Stripe account (free to start)
- Node.js and npm installed

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete account verification

### 1.2 Get API Keys
1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

## Step 2: Firebase Functions Setup

### 2.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase
```bash
firebase login
```

### 2.3 Initialize Functions (if not already done)
```bash
cd Client
firebase init functions
```

### 2.4 Install Dependencies
```bash
cd functions
npm install stripe cors
```

### 2.5 Set Stripe Configuration
```bash
firebase functions:config:set stripe.secret="sk_test_your_secret_key_here"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
```

### 2.6 Deploy Functions
```bash
firebase deploy --only functions
```

## Step 3: Client-Side Configuration

### 3.1 Environment Variables
Create a `.env` file in the Client directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3.2 Install Stripe Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Step 4: Webhook Setup

### 4.1 Install Stripe CLI
- Download from [Stripe CLI](https://stripe.com/docs/stripe-cli)
- Or install via package manager

### 4.2 Login to Stripe CLI
```bash
stripe login
```

### 4.3 Forward Webhooks to Local Development
```bash
stripe listen --forward-to localhost:5001/your-project-id/us-central1/stripeWebhook
```

### 4.4 Get Webhook Secret
Copy the webhook signing secret from the CLI output and update Firebase config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
```

### 4.5 For Production
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://your-region-your-project-id.cloudfunctions.net/stripeWebhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook secret and update Firebase config

## Step 5: Testing

### 5.1 Test Cards (Test Mode)
Use these test card numbers:
- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005
- **Declined**: 4000 0000 0000 0002

Use any future expiry date and any 3-digit CVC.

### 5.2 Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Select payment method
5. Use test card details
6. Complete payment

## Step 6: Production Setup

### 6.1 Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Get live API keys
3. Update environment variables with live keys
4. Update Firebase config with live secret

### 6.2 Update Firebase Config
```bash
firebase functions:config:set stripe.secret="sk_live_your_live_secret_key"
```

### 6.3 Deploy to Production
```bash
firebase deploy --only functions
```

## Step 7: Security Considerations

### 7.1 Environment Variables
- Never commit `.env` files to version control
- Use Firebase Functions config for server-side secrets
- Use environment variables for client-side public keys

### 7.2 Firestore Rules
Ensure your Firestore rules are properly configured:
```javascript
// Allow users to read their own orders
match /orders/{orderId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
}

// Allow users to read their own payments
match /payments/{paymentId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

## Step 8: Monitoring and Analytics

### 8.1 Stripe Dashboard
- Monitor payments in real-time
- View analytics and reports
- Handle disputes and refunds

### 8.2 Firebase Console
- Monitor function logs
- View Firestore data
- Track user analytics

## Troubleshooting

### Common Issues

1. **"Stripe is not configured" error**
   - Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure the key starts with `pk_test_` or `pk_live_`

2. **Payment intent creation fails**
   - Check Firebase Functions logs
   - Verify Stripe secret key is set correctly
   - Ensure user is authenticated

3. **Webhook not receiving events**
   - Check webhook endpoint URL
   - Verify webhook secret is correct
   - Check Firebase Functions logs

4. **CORS errors**
   - Ensure Firebase Functions has CORS enabled
   - Check domain configuration in Stripe

### Getting Help
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Stripe Support](https://support.stripe.com/)

## Payment Methods Supported

### India
- **Credit/Debit Cards**: Visa, Mastercard, RuPay, American Express
- **UPI**: Google Pay, PhonePe, Paytm, BHIM
- **Net Banking**: All major Indian banks
- **Digital Wallets**: Paytm, Mobikwik, Freecharge

### International
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Digital Wallets**: Apple Pay, Google Pay (where available)
- **Bank Transfers**: SEPA, ACH

## Cost Structure

### Stripe Fees (India)
- **Cards**: 2% + ₹2 per transaction
- **UPI**: 2% + ₹2 per transaction
- **Net Banking**: 2% + ₹2 per transaction
- **Digital Wallets**: 2% + ₹2 per transaction

### Firebase Blaze Plan
- **Functions**: $0.40 per million invocations
- **Firestore**: $0.06 per 100,000 document reads
- **Storage**: $0.026 per GB per month

## Next Steps

1. **Set up monitoring**: Configure alerts for failed payments
2. **Add analytics**: Track conversion rates and payment methods
3. **Implement refunds**: Set up refund functionality
4. **Add subscriptions**: Implement recurring payments if needed
5. **Mobile optimization**: Ensure payment flow works on mobile devices
