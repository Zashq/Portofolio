const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// STRIPE PAYMENT FUNCTIONS

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  try {
    const { items, shipping, successUrl, cancelUrl } = data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Items are required');
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: [item.image],
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
        },
        unit_amount: 500, 
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://yourdomain.com/checkout/success',
      cancel_url: cancelUrl || 'https://yourdomain.com/checkout',
      customer_email: shipping?.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'RO'], 
      },
      metadata: {
        userId: context.auth?.uid || 'guest',
        orderData: JSON.stringify({
          items: items,
          shipping: shipping,
        }),
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});


exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const { items, shipping } = data;
    
    if (!items || !Array.isArray(items)) {
      throw new functions.https.HttpsError('invalid-argument', 'Items are required');
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 5.00;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: {
        userId: context.auth?.uid || 'guest',
        items: JSON.stringify(items),
        shipping: JSON.stringify(shipping),
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: total,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Stripe Webhook Handler
 * Handles payment success events
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      const orderData = JSON.parse(session.metadata.orderData);
      await db.collection('orders').add({
        userId: session.metadata.userId,
        stripeSessionId: session.id,
        paymentStatus: session.payment_status,
        amount: session.amount_total / 100,
        items: orderData.items,
        shipping: orderData.shipping,
        customerEmail: session.customer_email,
        status: 'paid',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Order saved for session:', session.id);
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// PRICE ALERT CREATION

exports.createPriceAlert = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Be kell jelentkezned árfigyeléshez.'
    );
  }

  const { productId, targetPrice, productTitle, productImage } = data || {};

  if (!productId || typeof targetPrice !== 'number' || targetPrice <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Hibás productId vagy targetPrice.'
    );
  }

  const alertRef = db.collection('priceAlerts').doc();

  await alertRef.set({
    userId: context.auth.uid,
    productId: productId.toString(),
    targetPrice,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastNotifiedAt: null,
    productTitle: productTitle || null,
    productImage: productImage || null
  });

  return { id: alertRef.id };
});


// SCHEDULED PRODUCT FETCH & PRICE ALERTS

exports.scheduledProductFetch = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    console.log('Running scheduled product fetch');
    
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const products = response.data;
      
      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      for (const product of products) {
        const productRef = db.collection('products').doc(product.id.toString());
        const prevDoc = await productRef.get();
        const prevData = prevDoc.data();
        
        batch.set(productRef, {
          ...product,
          lastUpdated: timestamp,
          fetchedAt: new Date().toISOString()
        }, { merge: true });
        
        const historyRef = db.collection('priceHistory').doc();
        batch.set(historyRef, {
          productId: product.id,
          price: product.price,
          timestamp: new Date().toISOString()
        });
        
        if (prevData && prevData.price > product.price) {
          const priceDrop = prevData.price - product.price;
          const percentDrop = (priceDrop / prevData.price) * 100;
          
          await checkAndNotifyPriceAlerts(
            product.id, 
            product.title, 
            product.image,
            prevData.price, 
            product.price, 
            percentDrop
          );
        }
      }
      
      await batch.commit();
      console.log('Product fetch completed successfully');
      
      await db.collection('metadata').doc('lastFetch').set({
        timestamp: timestamp,
        productCount: products.length,
        status: 'success'
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      await db.collection('metadata').doc('lastFetch').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'error',
        error: error.message
      });
    }
    
    return null;
  });

async function checkAndNotifyPriceAlerts(productId, productTitle, productImage, oldPrice, newPrice, percentDrop) {
  try {
    const alertsSnapshot = await db.collection('priceAlerts')
      .where('productId', '==', productId.toString())
      .where('active', '==', true)
      .where('targetPrice', '>=', newPrice)
      .get();
    
    for (const doc of alertsSnapshot.docs) {
      const alert = doc.data();
      
      await db.collection('notifications').add({
        userId: alert.userId,
        type: 'price_drop',
        title: 'Price Drop Alert!',
        message: `${productTitle} dropped from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        data: {
          productId: productId,
          productTitle: productTitle,
          productImage: productImage,
          oldPrice: oldPrice,
          newPrice: newPrice,
          percentDrop: percentDrop
        }
      });

      await doc.ref.update({
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        active: false
      });

      console.log(`Alert triggered for user ${alert.userId} on product ${productId}`);
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
}

exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;

  try {
    await db.collection('users').doc(uid).delete().catch(() => {});
    await db.collection('carts').doc(uid).delete().catch(() => {});
    await db.collection('analytics_users').doc(uid).delete().catch(() => {});

    const ordersSnap = await db.collection('orders').where('userId', '==', uid).get();
    for (const doc of ordersSnap.docs) {
      await doc.ref.delete();
    }

    const alertsSnap = await db.collection('priceAlerts').where('userId', '==', uid).get();
    for (const doc of alertsSnap.docs) {
      await doc.ref.delete();
    }

    const notifSnap = await db.collection('notifications').where('userId', '==', uid).get();
    for (const doc of notifSnap.docs) {
      await doc.ref.delete();
    }

    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete account');
  }
});

