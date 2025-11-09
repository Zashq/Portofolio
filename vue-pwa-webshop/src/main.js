import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './registerServiceWorker'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Vue Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.VUE_APP_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID || "your-measurement-id"
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const functions = getFunctions(firebaseApp)
export const messaging = 'Notification' in window ? getMessaging(firebaseApp) : null

// Request notification permission and get token
if (messaging) {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      getToken(messaging, { 
        vapidKey: process.env.VUE_APP_FIREBASE_VAPID_KEY 
      }).then((currentToken) => {
        if (currentToken) {
          console.log('FCM Token:', currentToken)
          // Save token to Firestore for user
          localStorage.setItem('fcmToken', currentToken)
        }
      }).catch((err) => {
        console.error('An error occurred while retrieving token. ', err)
      })
    }
  })

  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload)
    // Show notification using Vue Toastification
    const app = document.getElementById('app').__vue_app__
    if (app) {
      app.config.globalProperties.$toast.info(payload.notification.body, {
        title: payload.notification.title
      })
    }
  })
}

// Vuetify configuration
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#4DBA87',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
      dark: {
        colors: {
          primary: '#4DBA87',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  }
})

// Toast configuration
const toastOptions = {
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)

app.mount('#app')
