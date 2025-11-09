const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe?.secret_key);
const endpointSecret = functions.config().stripe?.webhook_secret;

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await db.collection('orders').doc(orderId).set({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentIntentId: pi.id,
          amount: pi.amount_received,
          currency: pi.currency
        }, { merge: true });
      }
    }
    return res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e);
    return res.status(500).send('Internal error');
  }
});
