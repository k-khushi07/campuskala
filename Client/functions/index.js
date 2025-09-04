const functions = require('firebase-functions')
const admin = require('firebase-admin')
const stripe = require('stripe')(functions.config().stripe.secret)
const cors = require('cors')({ origin: true })

admin.initializeApp()
const db = admin.firestore()

// Create Stripe Payment Intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  try {
    const { amount, currency = 'inr', metadata = {} } = data
    
    // Create or get Stripe customer
    const userId = context.auth.uid
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    let customerId = userData?.stripeCustomerId
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.displayName,
        metadata: { firebaseUID: userId }
      })
      
      customerId = customer.id
      
      // Save customer ID to user document
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId
      })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        userId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    })

    return {
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id
    }
  } catch (error) {
    console.error('Create payment intent error:', error)
    throw new functions.https.HttpsError('internal', 'Unable to create payment intent')
  }
})

// Create Stripe Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  try {
    const { line_items, success_url, cancel_url, metadata = {} } = data
    const userId = context.auth.uid

    // Get or create Stripe customer
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    let customerId = userData?.stripeCustomerId
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.displayName,
        metadata: { firebaseUID: userId }
      })
      
      customerId = customer.id
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url,
      cancel_url,
      metadata: {
        userId,
        ...metadata
      }
    })

    return {
      id: session.id,
      url: session.url
    }
  } catch (error) {
    console.error('Create checkout session error:', error)
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session')
  }
})

// Stripe Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    const webhookSecret = functions.config().stripe.webhook_secret
    const signature = req.headers['stripe-signature']
    
    let event
    
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return res.status(400).send('Webhook signature verification failed')
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object)
          break
          
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object)
          break
          
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object)
          break
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionChange(event.data.object)
          break
          
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      res.status(200).send('Webhook handled successfully')
    } catch (error) {
      console.error('Webhook handler error:', error)
      res.status(500).send('Webhook handler failed')
    }
  })
})

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent) {
  const { metadata } = paymentIntent
  
  if (metadata.orderId) {
    // Update order status
    await db.collection('orders').doc(metadata.orderId).update({
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntent.id,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Create payment record
    await db.collection('payments').add({
      orderId: metadata.orderId,
      userId: metadata.userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'succeeded',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Send notification to user
    await db.collection('notifications').add({
      userId: metadata.userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ₹${paymentIntent.amount / 100} has been processed successfully.`,
      orderId: metadata.orderId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent) {
  const { metadata } = paymentIntent
  
  if (metadata.orderId) {
    await db.collection('orders').doc(metadata.orderId).update({
      paymentStatus: 'failed',
      paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Send notification to user
    await db.collection('notifications').add({
      userId: metadata.userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      orderId: metadata.orderId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
  }
}

// Handle completed checkout session
async function handleCheckoutCompleted(session) {
  // Similar to payment succeeded but for checkout sessions
  const { metadata } = session
  
  if (metadata.orderId) {
    await handlePaymentSucceeded({
      id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      metadata
    })
  }
}

// Handle subscription changes
async function handleSubscriptionChange(subscription) {
  const customerId = subscription.customer
  
  // Find user by Stripe customer ID
  const usersQuery = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get()
  
  if (!usersQuery.empty) {
    const userDoc = usersQuery.docs[0]
    
    await userDoc.ref.update({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  }
}

// Process refund
exports.processRefund = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  try {
    const { payment_intent_id, amount, reason = 'requested_by_customer' } = data
    
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason
    })

    // Record refund in database
    await db.collection('refunds').add({
      stripeRefundId: refund.id,
      paymentIntentId: payment_intent_id,
      amount: refund.amount / 100,
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      id: refund.id,
      status: refund.status,
      amount: refund.amount / 100
    }
  } catch (error) {
    console.error('Process refund error:', error)
    throw new functions.https.HttpsError('internal', 'Unable to process refund')
  }
})

// Create Stripe Connect account for sellers
exports.createConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  try {
    const userId = context.auth.uid
    const { email, country = 'IN' } = data

    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    })

    // Save Connect account ID to user document
    await db.collection('users').doc(userId).update({
      stripeConnectAccountId: account.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      accountId: account.id
    }
  } catch (error) {
    console.error('Create Connect account error:', error)
    throw new functions.https.HttpsError('internal', 'Unable to create Connect account')
  }
})

// Send notification (can be triggered by other functions)
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data()
    const { userId, title, message, type } = notification

    try {
      // Get user's FCM token for push notifications
      const userDoc = await db.collection('users').doc(userId).get()
      const userData = userDoc.data()
      
      if (userData?.fcmToken) {
        const payload = {
          notification: {
            title,
            body: message,
            icon: '/favicon.ico'
          },
          data: {
            type,
            notificationId: context.params.notificationId
          }
        }

        await admin.messaging().sendToDevice(userData.fcmToken, payload)
      }
    } catch (error) {
      console.error('Send notification error:', error)
    }
  })

// Clean up old notifications (runs daily)
exports.cleanupNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldNotifications = await db.collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .get()

    const batch = db.batch()
    oldNotifications.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Deleted ${oldNotifications.size} old notifications`)
  })
