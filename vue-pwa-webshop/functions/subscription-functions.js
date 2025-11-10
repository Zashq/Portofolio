// Add these functions to your functions/index.js file

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe?.secret_key || 'sk_test_YOUR_KEY');

const db = admin.firestore();

// Create subscription
exports.createSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { priceId } = data;

  try {
    // Get or create Stripe customer
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      // Create new customer
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: {
          firebaseUID: context.auth.uid
        }
      });
      customerId = customer.id;

      // Save customer ID
      await db.collection('users').doc(context.auth.uid).set({
        stripeCustomerId: customerId
      }, { merge: true });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    // Save subscription to Firestore
    await db.collection('subscriptions').doc(subscription.id).set({
      userId: context.auth.uid,
      subscriptionId: subscription.id,
      customerId: customerId,
      priceId: priceId,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Cancel subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subscriptionId } = data;

  try {
    // Verify ownership
    const subDoc = await db.collection('subscriptions').doc(subscriptionId).get();
    if (!subDoc.exists || subDoc.data().userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Cancel subscription
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update Firestore
    await db.collection('subscriptions').doc(subscriptionId).update({
      status: 'canceled',
      canceledAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user subscriptions
exports.getSubscriptions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const subscriptions = await db.collection('subscriptions')
      .where('userId', '==', context.auth.uid)
      .where('status', 'in', ['active', 'trialing'])
      .get();

    return subscriptions.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe?.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      await db.collection('subscriptions').doc(subscription.id).update({
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice.id);
      break;

    case 'invoice.payment_failed':
      console.log('Payment failed');
      break;

    default:
  console.log('Unhandled event type ' + event.type);

  }

  res.json({ received: true });
});
