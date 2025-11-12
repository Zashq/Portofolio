// functions/index.js - Updated with proper Stripe integration

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ============================================
// STRIPE PAYMENT FUNCTIONS
// ============================================

/**
 * Create Stripe Checkout Session with line items
 * This is the proper way to handle Stripe payments
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  try {
    const { items, shipping, successUrl, cancelUrl } = data;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Items are required');
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: [item.image],
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
        },
        unit_amount: 500, // $5.00 in cents
      },
      quantity: 1,
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://yourdomain.com/checkout/success',
      cancel_url: cancelUrl || 'https://yourdomain.com/checkout',
      customer_email: shipping?.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'RO'], // Add countries as needed
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

/**
 * Alternative: Create Payment Intent (for custom checkout form)
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const { items, shipping } = data;
    
    if (!items || !Array.isArray(items)) {
      throw new functions.https.HttpsError('invalid-argument', 'Items are required');
    }

    // Calculate total from items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 5.00;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Save order to Firestore
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

// ============================================
// SCHEDULED PRODUCT FETCH & PRICE ALERTS
// ============================================

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
        
        // Update product
        batch.set(productRef, {
          ...product,
          lastUpdated: timestamp,
          fetchedAt: new Date().toISOString()
        }, { merge: true });
        
        // Store price history
        const historyRef = db.collection('priceHistory').doc();
        batch.set(historyRef, {
          productId: product.id,
          price: product.price,
          timestamp: new Date().toISOString()
        });
        
        // Check for price drops
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
      
      // Create notification
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

      // Mark alert as triggered
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
