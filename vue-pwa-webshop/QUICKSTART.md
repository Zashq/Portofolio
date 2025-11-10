# 🚀 VueShop Quick Start Guide

Get your VueShop PWA up and running in minutes!

## ⚡ Super Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
cd api && npm install && cd ..
cd functions && npm install && cd ..
```

### 2. Configure Environment
```bash
# Create .env file
cp .env.example .env
```

Edit `.env` with your Firebase credentials (get them from Firebase Console).

### 3. Run the App
```bash
# Terminal 1: Start Frontend
npm run serve

# Terminal 2: Start API
cd api && npm run dev
```

Visit: http://localhost:8080

That's it! 🎉

---

## 📋 Detailed Setup

### Prerequisites
- ✅ Node.js 14+ installed
- ✅ npm or yarn
- ✅ Firebase account (free tier is fine)

### Step-by-Step Setup

#### 1️⃣ Firebase Project Setup (10 minutes)

**A. Create Firebase Project**
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "vueshop-demo")
4. Disable Google Analytics (optional)
5. Click "Create project"

**B. Enable Authentication**
1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Enable these providers:
   - Email/Password ✅
   - Google (optional) ⭕
   - Facebook (optional) ⭕

**C. Create Firestore Database**
1. Click "Firestore Database"
2. Click "Create database"
3. Choose "Production mode"
4. Select a location (e.g., us-central)
5. Click "Enable"

**D. Get Firebase Configuration**
1. Click gear icon (⚙️) > "Project settings"
2. Scroll to "Your apps"
3. Click web icon (</>) to add web app
4. Name it "VueShop Web"
5. ✅ Check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the configuration object

**E. Enable Cloud Messaging (for notifications)**
1. In Project Settings
2. Go to "Cloud Messaging" tab
3. Copy the "Web Push certificates" VAPID key

#### 2️⃣ Local Configuration (5 minutes)

**Create .env file:**
```bash
cp .env.example .env
```

**Edit .env with your Firebase config:**
```env
# Get these from Firebase Console > Project Settings > Your apps
VUE_APP_FIREBASE_API_KEY=AIzaSy...
VUE_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
VUE_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
VUE_APP_FIREBASE_MEASUREMENT_ID=G-ABCDEF123

# From Cloud Messaging > Web Push certificates
VUE_APP_FIREBASE_VAPID_KEY=BNzX...

# API Configuration (use defaults for local development)
VUE_APP_API_BASE_URL=http://localhost:3001/api
VUE_APP_USE_LOCAL_API=true

# Stripe (optional - for payments)
VUE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 3️⃣ Install & Run (2 minutes)

```bash
# Install all dependencies
npm install
cd api && npm install && cd ..
cd functions && npm install && cd ..

# Start development servers
# Terminal 1: Frontend
npm run serve

# Terminal 2: API
cd api && npm run dev

# Terminal 3: Firebase Functions (optional)
firebase login
firebase emulators:start --only functions
```

#### 4️⃣ Test the App

1. Open http://localhost:8080
2. Browse products
3. Register an account
4. Add products to cart
5. View cart & checkout

---

## 🎯 What You Get Out of the Box

### ✅ Working Features
- 🛍️ Product browsing & search
- 🛒 Shopping cart
- 👤 User authentication
- 📦 Order history
- 🔔 Price alerts
- 📊 Analytics dashboard
- 💳 Payment ready (Stripe)
- 📱 PWA (installable app)
- 🔄 Offline support

### 📦 Pre-configured Services
- Firebase Authentication
- Firestore Database
- Cloud Functions
- Cloud Messaging (FCM)
- Product API
- Stripe Integration

---

## 🎨 Customization

### Change Theme Colors

Edit `src/main.js`:
```javascript
theme: {
  themes: {
    light: {
      colors: {
        primary: '#4DBA87',    // Your brand color
        secondary: '#424242',
        accent: '#82B1FF',
      }
    }
  }
}
```

### Change App Name & Icons

1. Edit `public/manifest.json`:
```json
{
  "name": "Your Shop Name",
  "short_name": "YourShop"
}
```

2. Replace icons in `public/img/icons/`

### Add Your Products

**Option 1: Use API**
```javascript
// Add products via API
POST http://localhost:3001/api/products
{
  "title": "Your Product",
  "price": 29.99,
  "category": "electronics",
  "description": "Product description",
  "image": "https://..."
}
```

**Option 2: Import to Firestore**
```javascript
// In Firebase Console > Firestore
// Create documents in 'products' collection
```

**Option 3: Bulk Import**
```bash
# Using the API
POST http://localhost:3001/api/products/bulk
{
  "products": [
    { "title": "Product 1", ... },
    { "title": "Product 2", ... }
  ]
}
```

---

## 🔧 Optional Setup

### Stripe Payment Integration

1. Create account at https://stripe.com
2. Get test API keys from Dashboard
3. Add to `.env`:
```env
VUE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
4. Configure Firebase Function:
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
```

### Email Notifications

1. Enable Email provider in Firebase Authentication
2. Configure email templates in Firebase Console
3. Uncomment email sending code in `functions/index.js`

### Social Login (Google)

1. In Firebase Console > Authentication
2. Enable Google provider
3. Add OAuth client ID
4. Test with Google Sign-In button

---

## 📱 Testing PWA Features

### Install as App

1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or: Chrome Menu > Install VueShop

### Test Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline"
4. Refresh page - should still work!

### Test Notifications

1. Allow notifications when prompted
2. Set a price alert
3. Wait for notification (or trigger manually via Firebase)

---

## 🚀 Deploy to Production

### Quick Deploy

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

Your app will be live at: `your-project-id.web.app`

### Deploy API

**Option 1: Heroku**
```bash
cd api
heroku create your-api-name
git push heroku main
```

**Option 2: Google Cloud Run**
```bash
gcloud run deploy product-api \
  --source api/ \
  --allow-unauthenticated
```

---

## 🆘 Troubleshooting

### "Firebase not initialized"
✅ Check `.env` file exists and has correct values
✅ Restart dev server after changing `.env`

### "API connection failed"
✅ Make sure API server is running: `cd api && npm run dev`
✅ Check port 3001 is available
✅ Verify API URL in `.env`

### "Authentication error"
✅ Enable Email/Password in Firebase Console
✅ Check Firebase config in `.env`
✅ Clear browser cache and cookies

### "Products not loading"
✅ Check API is running
✅ Check browser console for errors
✅ Verify network is not blocking requests
✅ Try: http://localhost:3001/api/health

### "Service worker not working"
✅ PWA only works over HTTPS or localhost
✅ Build for production: `npm run build`
✅ Clear service workers in DevTools

---

## 📚 Learn More

### Tutorials
- Adding new pages → See `src/views/`
- Adding new components → See `src/components/`
- Managing state → See `src/store/`
- API routes → See `api/server.js`

### Documentation
- [Full Project Documentation](./PROJECT_STATUS.md)
- [API Documentation](./api/README.md)
- [Firebase Functions](./functions/)

---

## 💡 Quick Tips

1. **Development Speed**: Use `npm run serve` for hot reload
2. **Debugging**: Check browser console (F12) for errors
3. **Database**: View data in Firebase Console > Firestore
4. **Logs**: Check Firebase Console > Functions > Logs
5. **Testing**: Use Chrome DevTools for PWA features

---

## ✨ Next Steps

Once you have the basics running:

1. ✅ Customize theme and branding
2. ✅ Add your own products
3. ✅ Set up Stripe for real payments
4. ✅ Configure email notifications
5. ✅ Add product reviews
6. ✅ Build admin dashboard
7. ✅ Deploy to production

---

## 🎉 You're All Set!

Your VueShop PWA is now running!

- Frontend: http://localhost:8080
- API: http://localhost:3001/api
- API Docs: http://localhost:3001/api

**Need help?** Check:
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Detailed documentation
- [api/README.md](./api/README.md) - API documentation
- Firebase Console - Logs and monitoring

Happy coding! 🚀
