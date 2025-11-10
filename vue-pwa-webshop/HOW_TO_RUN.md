# 🚀 How to Run Your VueShop Project

## Current Status: ✅ Ready to Run!

Your project uses **fakestoreapi.com** for products, so you don't need a separate API.

---

## Step 1: Install Dependencies (5 minutes)

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies (optional)
cd functions
npm install
cd ..
```

---

## Step 2: Configure Firebase (REQUIRED)

### A. Create Firebase Project (if you haven't already)

1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "vueshop")
4. Click "Create project"

### B. Enable Services

**1. Authentication:**
- Click "Authentication" → "Get started"
- Enable "Email/Password" provider
- ✅ Click "Save"

**2. Firestore Database:**
- Click "Firestore Database" → "Create database"
- Select "Start in production mode"
- Choose your region (e.g., europe-west)
- ✅ Click "Enable"

**3. Cloud Messaging (for notifications):**
- Go to Project Settings (⚙️ icon)
- Click "Cloud Messaging" tab
- Copy your "Server key" (you'll need this later)

### C. Get Your Firebase Config

1. In Firebase Console, click ⚙️ → "Project settings"
2. Scroll to "Your apps"
3. Click the web icon `</>` 
4. Register app: name it "VueShop"
5. Copy the config object

### D. Configure Your Project

**Create `.env` file:**
```bash
# In your project root
cp .env.example .env
```

**Edit `.env` file with your Firebase credentials:**
```env
# Paste your Firebase config here
VUE_APP_FIREBASE_API_KEY=AIzaSy...
VUE_APP_FIREBASE_AUTH_DOMAIN=vueshop-xxx.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=vueshop-xxx
VUE_APP_FIREBASE_STORAGE_BUCKET=vueshop-xxx.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
VUE_APP_FIREBASE_APP_ID=1:123456789:web:abc123
VUE_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VUE_APP_FIREBASE_VAPID_KEY=BNzX... (from Cloud Messaging)

# Stripe (OPTIONAL - only if you want payments)
VUE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Step 3: Run the Project

### Option A: Just Frontend (Quick Start)

```bash
npm run serve
```

Open: **http://localhost:8080**

✅ This will work immediately with fakestoreapi.com!

### Option B: With Firebase Functions (Full Features)

**Terminal 1 - Frontend:**
```bash
npm run serve
```

**Terminal 2 - Firebase Functions (optional):**
```bash
# First, login to Firebase
firebase login

# Then start emulators
firebase emulators:start
```

---

## Step 4: Test Everything

### ✅ Test Checklist:

1. **Products Loading**
   - Visit home page
   - Should see products from fakestoreapi.com
   - ✅ If you see products → Working!

2. **Authentication**
   - Click "Register" or "Login"
   - Create an account
   - ✅ If you can register → Firebase Auth working!

3. **Shopping Cart**
   - Add product to cart
   - View cart
   - ✅ Should save items → Working!

4. **Product Details**
   - Click on any product
   - Should see details
   - ✅ Working!

---

## 🔥 Firebase Status Check

### What You NEED:
- ✅ Firebase project created
- ✅ Authentication enabled
- ✅ Firestore database created
- ✅ `.env` file configured

### What's OPTIONAL (for later):
- ⭕ Firebase Functions deployed (for scheduled jobs)
- ⭕ Cloud Messaging (for push notifications)
- ⭕ Stripe (for payments)

---

## 🎯 Quick Firebase Setup Commands

### If Firebase CLI is not installed:
```bash
npm install -g firebase-tools
```

### Login to Firebase:
```bash
firebase login
```

### Initialize Firebase (if needed):
```bash
firebase init

# Select:
# - Hosting
# - Firestore
# - Functions (optional)
```

### Deploy Functions (optional):
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 🐛 Troubleshooting

### Problem: "Firebase not initialized"
**Solution:**
1. Check `.env` file exists
2. Verify all Firebase variables are set
3. Restart dev server: Stop (Ctrl+C) and run `npm run serve` again

### Problem: "No products loading"
**Solution:**
1. Check internet connection
2. Open browser console (F12) - check for errors
3. Fakestoreapi.com should be accessible

### Problem: "Can't register/login"
**Solution:**
1. Go to Firebase Console → Authentication
2. Make sure "Email/Password" is enabled
3. Check `.env` has correct Firebase config

### Problem: "Firebase Functions not working"
**Solution:**
```bash
# Make sure you're logged in
firebase login

# Try running emulators
cd functions
npm install
cd ..
firebase emulators:start
```

---

## 📊 What's Working Without Firebase Functions?

Even without deploying Firebase Functions, you get:

✅ **Working Features:**
- Product browsing (from fakestoreapi.com)
- Shopping cart
- User authentication
- Order history
- User profile
- Search
- Category filtering

❌ **Not Working (needs Functions):**
- Scheduled product updates
- Price alerts/notifications
- Analytics aggregation
- Stripe payments

---

## 🎯 Minimal Setup to Start

**For just testing/development:**

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` with Firebase config
3. ✅ Enable Firebase Auth (Email/Password)
4. ✅ Create Firestore database
5. ✅ Run: `npm run serve`

**That's it!** You can browse products, add to cart, and register users.

---

## 🚀 Next Steps

### Now (Immediate):
1. Get project running locally
2. Test basic features
3. Explore the UI

### Later (When Ready):
1. Deploy Firebase Functions for alerts
2. Set up Stripe for payments
3. Add your own products (or create custom API)
4. Deploy to production

---

## 📝 Important Files

- **`.env`** - Your Firebase configuration (YOU MUST CREATE THIS!)
- **`src/services/productService.js`** - Uses fakestoreapi.com
- **`src/main.js`** - Firebase initialization
- **`functions/index.js`** - Firebase Functions (optional)

---

## 🆘 Still Having Issues?

### Check:
1. ✅ `.env` file exists and has Firebase config
2. ✅ `npm install` completed without errors
3. ✅ Firebase project created in console
4. ✅ Authentication enabled in Firebase
5. ✅ Internet connection working

### Commands to Try:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Check Node version (should be 14+)
node --version

# Run with verbose logging
npm run serve -- --verbose
```

---

## ✨ You're Ready!

**To start developing:**
```bash
npm run serve
```

**Your app:** http://localhost:8080

**Firebase Console:** https://console.firebase.google.com/

---

Good luck! 🚀
