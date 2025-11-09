const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const stripe = require('stripe')(functions.config().stripe?.secret_key || 'sk_test_YOUR_STRIPE_SECRET_KEY');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Scheduled function to fetch product data every hour
exports.scheduledProductFetch = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    console.log('Running scheduled product fetch');
    
    try {
      // Fetch products from FakeStore API
      const response = await axios.get('https://fakestoreapi.com/products');
      const products = response.data;
      
      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      for (const product of products) {
        const productRef = db.collection('products').doc(product.id.toString());
        
        // Get previous product data
        const prevDoc = await productRef.get();
        const prevData = prevDoc.data();
        
        // Update product
        batch.set(productRef, {
          ...product,
          lastUpdated: timestamp,
          fetchedAt: new Date().toISOString()
        }, { merge: true });
        
        // Track price history
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
          
          // Check price alerts
          await checkAndNotifyPriceAlerts(product.id, product.title, prevData.price, product.price, percentDrop);
        }
      }
      
      await batch.commit();
      console.log('Product fetch completed successfully');
      
      // Store fetch metadata
      await db.collection('metadata').doc('lastFetch').set({
        timestamp: timestamp,
        productCount: products.length,
        status: 'success'
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Store error metadata
      await db.collection('metadata').doc('lastFetch').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'error',
        error: error.message
      });
    }
    
    return null;
  });

// Function to check price alerts and notify users
async function checkAndNotifyPriceAlerts(productId, productTitle, oldPrice, newPrice, percentDrop) {
  try {
    // Get all price alerts for this product
    const alertsSnapshot = await db.collection('priceAlerts')
      .where('productId', '==', productId)
      .where('active', '==', true)
      .where('targetPrice', '>=', newPrice)
      .get();
    
    const notifications = [];
    
    for (const doc of alertsSnapshot.docs) {
      const alert = doc.data();
      
      // Create notification for user
      const notification = {
        userId: alert.userId,
        title: 'Price Drop Alert!',
        message: `${productTitle} dropped from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)} (${percentDrop.toFixed(1)}% off)`,
        type: 'price_drop',
        data: {
          productId,
          oldPrice,
          newPrice,
          percentDrop
        },
        read: false,
        timestamp: new Date().toISOString()
      };
      
      notifications.push(notification);
      
      // Update alert status
      await doc.ref.update({
        triggered: true,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        triggeredPrice: newPrice
      });
    }
    
    // Batch create notifications
    if (notifications.length > 0) {
      const batch = db.batch();
      notifications.forEach(notification => {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, notification);
      });
      await batch.commit();
      
      // Send push notifications
      await sendPushNotifications(notifications);
    }
    
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
}

// Send push notifications via FCM
async function sendPushNotifications(notifications) {
  const messages = [];
  
  for (const notif of notifications) {
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(notif.userId).get();
    const userData = userDoc.data();
    
    if (userData && userData.fcmToken) {
      messages.push({
        notification: {
          title: notif.title,
          body: notif.message
        },
        data: notif.data,
        token: userData.fcmToken
      });
    }
  }
  
  if (messages.length > 0) {
    try {
      const response = await messaging.sendAll(messages);
      console.log(`Successfully sent ${response.successCount} notifications`);
      if (response.failureCount > 0) {
        console.error(`Failed to send ${response.failureCount} notifications`);
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}

// Create price alert
exports.createPriceAlert = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { productId, targetPrice, productTitle } = data;
  
  if (!productId || !targetPrice) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    const alert = {
      userId: context.auth.uid,
      productId,
      productTitle,
      targetPrice,
      active: true,
      triggered: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('priceAlerts').add(alert);
    
    return { 
      success: true, 
      alertId: docRef.id,
      message: `Price alert created for ${productTitle} at $${targetPrice}`
    };
  } catch (error) {
    console.error('Error creating price alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create price alert');
  }
});

// Delete price alert
exports.deletePriceAlert = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { alertId } = data;
  
  if (!alertId) {
    throw new functions.https.HttpsError('invalid-argument', 'Alert ID is required');
  }
  
  try {
    const alertDoc = await db.collection('priceAlerts').doc(alertId).get();
    
    if (!alertDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Alert not found');
    }
    
    if (alertDoc.data().userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to delete this alert');
    }
    
    await alertDoc.ref.delete();
    
    return { success: true, message: 'Alert deleted successfully' };
  } catch (error) {
    console.error('Error deleting price alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete price alert');
  }
});

// Stripe payment intent creation
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { amount, currency = 'usd', metadata = {} } = data;
  
  if (!amount || amount < 50) { // Stripe minimum is 50 cents
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
        userId: context.auth.uid
      }
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
  }
});

// Process completed order
exports.processOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { paymentIntentId, items, shippingAddress, total } = data;
  
  if (!paymentIntentId || !items || !shippingAddress) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    }
    
    // Create order
    const order = {
      userId: context.auth.uid,
      paymentIntentId,
      items,
      shippingAddress,
      total,
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      orderNumber: generateOrderNumber()
    };
    
    const orderRef = await db.collection('orders').add(order);
    
    // Clear user's cart
    await db.collection('carts').doc(context.auth.uid).delete();
    
    // Create notification
    await db.collection('notifications').add({
      userId: context.auth.uid,
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
      type: 'order',
      data: {
        orderId: orderRef.id,
        orderNumber: order.orderNumber
      },
      read: false,
      timestamp: new Date().toISOString()
    });
    
    // Send confirmation email (you would implement this)
    // await sendOrderConfirmationEmail(context.auth.uid, order);
    
    return {
      success: true,
      orderId: orderRef.id,
      orderNumber: order.orderNumber
    };
  } catch (error) {
    console.error('Error processing order:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process order');
  }
});

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Analytics aggregation (runs daily)
exports.aggregateAnalytics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Running analytics aggregation');
    
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Aggregate order data
      const ordersSnapshot = await db.collection('orders')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', now)
        .get();
      
      let totalRevenue = 0;
      let orderCount = 0;
      const productsSold = {};
      
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        totalRevenue += order.total;
        orderCount++;
        
        order.items.forEach(item => {
          if (!productsSold[item.id]) {
            productsSold[item.id] = {
              quantity: 0,
              revenue: 0
            };
          }
          productsSold[item.id].quantity += item.quantity;
          productsSold[item.id].revenue += item.price * item.quantity;
        });
      });
      
      // Store analytics
      await db.collection('analytics').doc(yesterday.toISOString().split('T')[0]).set({
        date: yesterday.toISOString(),
        totalRevenue,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
        productsSold,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Analytics aggregation completed');
    } catch (error) {
      console.error('Error aggregating analytics:', error);
    }
    
    return null;
  });

// Update FCM token
exports.updateFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { token } = data;
  
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'FCM token is required');
  }
  
  try {
    await db.collection('users').doc(context.auth.uid).update({
      fcmToken: token,
      fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update FCM token');
  }
});

module.exports = exports;
