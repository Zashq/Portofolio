# VueShop - Modern E-Commerce PWA

A full-featured Progressive Web App (PWA) e-commerce platform built with Vue 3, Vuetify, Firebase, and Stripe.

## Features

### Core E-Commerce
- 🛍️ Product browsing with categories and search
- 🛒 Shopping cart with persistence
- 💳 Multi-step checkout process
- 📦 Order history and tracking
- ⭐ Product ratings and reviews
- 🔖 Price alerts and notifications

### User Features
- 🔐 Authentication (Email, Google, Facebook)
- 👤 User profiles and preferences
- 📍 Multiple saved addresses
- 🔔 Real-time notifications
- 📊 Shopping analytics dashboard

### Technical Features
- 📱 Progressive Web App (installable)
- 🔄 Offline support with service workers
- 🎨 Material Design 3 with Vuetify
- 🔥 Firebase backend (Auth, Firestore, Functions)
- 💰 Stripe payment integration
- 📈 Price history tracking
- 🌐 Responsive design (mobile, tablet, desktop)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Stripe account (optional, for payments)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd vue-pwa-webshop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google, Facebook)
3. Create a Firestore database
4. Copy your Firebase configuration
5. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

6. Update `.env` with your Firebase credentials:

```env
VUE_APP_FIREBASE_API_KEY=your-api-key
VUE_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VUE_APP_FIREBASE_APP_ID=your-app-id
VUE_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
VUE_APP_FIREBASE_VAPID_KEY=your-vapid-key
```

### 4. Configure Stripe (Optional)

If you want to enable payments:

1. Create a Stripe account at [Stripe](https://stripe.com/)
2. Get your API keys from the Stripe dashboard
3. Add to `.env`:

```env
VUE_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

4. Configure Firebase Functions with Stripe secret key:

```bash
cd functions
firebase functions:config:set stripe.secret_key="your-stripe-secret-key"
```

### 5. Deploy Firebase Functions (Optional)

```bash
cd functions
npm install
firebase deploy --only functions
```

## Development

### Run development server

```bash
npm run serve
```

The app will be available at `http://localhost:8080`

### Build for production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Project Structure

```
vue-pwa-webshop/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable Vue components
│   ├── views/          # Page components
│   ├── router/         # Vue Router configuration
│   ├── store/          # Pinia stores (state management)
│   ├── services/       # API services
│   ├── App.vue         # Root component
│   └── main.js         # App entry point
├── functions/          # Firebase Cloud Functions
├── .env.example        # Environment variables template
├── vue.config.js       # Vue CLI configuration
└── package.json        # Dependencies
```

## Available Scripts

- `npm run serve` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Lint and fix code
- `npm run firebase:deploy` - Deploy to Firebase
- `npm run functions:serve` - Run Firebase functions locally
- `npm run functions:deploy` - Deploy Firebase functions

## Key Technologies

- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Firebase** - Backend services (Auth, Firestore, Functions, Messaging)
- **Stripe** - Payment processing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **PWA** - Progressive Web App features

## Features in Detail

### Authentication
- Email/Password login and registration
- Social authentication (Google, Facebook)
- Password strength validation
- Secure session management

### Shopping Experience
- Product search and filtering
- Category browsing
- Price range filters
- Sort options (price, name, rating)
- Product details with images and descriptions
- Related products suggestions

### Cart & Checkout
- Persistent shopping cart (localStorage + Firestore)
- Quantity management
- Real-time price calculation
- Tax and shipping calculation
- Multi-step checkout wizard
- Address management
- Payment integration with Stripe

### User Dashboard
- Order history with status tracking
- Profile management
- Address book
- Password change
- Notification preferences
- Shopping analytics

### Admin Features (via Firebase Functions)
- Scheduled product data fetching
- Price monitoring and alerts
- Order processing
- Analytics aggregation
- Push notifications

## Troubleshooting

### Firebase Initialization Errors
If you see Firebase errors, ensure:
1. All environment variables are set in `.env`
2. Firebase project is properly configured
3. Authentication methods are enabled in Firebase Console

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v14+)

### Service Worker Issues
- Clear browser cache and service workers in DevTools
- Rebuild the project: `npm run build`
- Service workers only work in production or over HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review Firebase and Vue.js documentation

## Roadmap

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced search filters
- [ ] Product recommendations ML
- [ ] Inventory management
- [ ] Admin dashboard
- [ ] Email notifications

---

Built with ❤️ using Vue 3 and Firebase
