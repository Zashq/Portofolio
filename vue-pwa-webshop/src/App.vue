<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="cursor-pointer" @click="$router.push('/')">
        <v-icon left>mdi-shopping</v-icon>
        VueShop
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        append-icon="mdi-magnify"
        label="Search products..."
        single-line
        hide-details
        class="mr-4"
        style="max-width: 300px"
        @keyup.enter="searchProducts"
      ></v-text-field>

      <!-- Cart Icon -->
      <v-btn icon @click="$router.push('/cart')">
        <v-badge :content="cartItemsCount" :value="cartItemsCount > 0" color="red">
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>

      <!-- Notifications -->
      <v-btn icon @click="showNotifications = !showNotifications">
        <v-badge :content="unreadNotifications" :value="unreadNotifications > 0" color="red">
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-if="!isAuthenticated" @click="$router.push('/login')">
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAuthenticated" @click="$router.push('/profile')">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAuthenticated" @click="$router.push('/orders')">
            <v-list-item-title>My Orders</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAuthenticated" @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item @click="$router.push('/')">
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/products')">
          <template v-slot:prepend>
            <v-icon>mdi-shopping</v-icon>
          </template>
          <v-list-item-title>Products</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/categories')">
          <template v-slot:prepend>
            <v-icon>mdi-shape</v-icon>
          </template>
          <v-list-item-title>Categories</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/analytics')">
          <template v-slot:prepend>
            <v-icon>mdi-chart-line</v-icon>
          </template>
          <v-list-item-title>Analytics</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/alerts')">
          <template v-slot:prepend>
            <v-icon>mdi-alert</v-icon>
          </template>
          <v-list-item-title>Price Alerts</v-list-item-title>
        </v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="primary" @click="$router.push('/settings')">
            <v-icon left>mdi-cog</v-icon>
            Settings
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Notifications Panel -->
    <v-navigation-drawer
      v-model="showNotifications"
      app
      temporary
      right
      width="400"
    >
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Notifications</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="markAllAsRead">
          <v-icon>mdi-check-all</v-icon>
        </v-btn>
      </v-toolbar>
      
      <v-list>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          @click="markAsRead(notification.id)"
        >
          <template v-slot:prepend>
            <v-icon :color="getNotificationColor(notification.type)">
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </template>
          <v-list-item-title>{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption">
            {{ formatDate(notification.timestamp) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app color="primary" dark>
      <v-row justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>VueShop PWA</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { useNotificationStore } from '@/store/notifications'
import { signOut } from 'firebase/auth'
import { auth } from '@/main'
import { useToast } from 'vue-toastification'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const notificationStore = useNotificationStore()
    const toast = useToast()
    
    const drawer = ref(false)
    const showNotifications = ref(false)
    const searchQuery = ref('')
    
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const cartItemsCount = computed(() => cartStore.itemsCount)
    const notifications = computed(() => notificationStore.notifications)
    const unreadNotifications = computed(() => notificationStore.unreadCount)
    
    const searchProducts = () => {
      if (searchQuery.value) {
        router.push(`/search?q=${searchQuery.value}`)
      }
    }
    
    const logout = async () => {
      try {
        await signOut(auth)
        userStore.logout()
        toast.success('Successfully logged out')
        router.push('/login')
      } catch (error) {
        toast.error('Error logging out')
        console.error(error)
      }
    }
    
    const markAsRead = (id) => {
      notificationStore.markAsRead(id)
    }
    
    const markAllAsRead = () => {
      notificationStore.markAllAsRead()
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        price_drop: 'mdi-trending-down',
        order: 'mdi-package-variant',
        alert: 'mdi-alert',
        info: 'mdi-information'
      }
      return icons[type] || 'mdi-bell'
    }
    
    const getNotificationColor = (type) => {
      const colors = {
        price_drop: 'success',
        order: 'primary',
        alert: 'warning',
        info: 'info'
      }
      return colors[type] || 'grey'
    }
    
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    onMounted(() => {
      userStore.checkAuth()
      cartStore.loadCart()
      notificationStore.loadNotifications()
    })
    
    return {
      drawer,
      showNotifications,
      searchQuery,
      isAuthenticated,
      cartItemsCount,
      notifications,
      unreadNotifications,
      searchProducts,
      logout,
      markAsRead,
      markAllAsRead,
      getNotificationIcon,
      getNotificationColor,
      formatDate
    }
  }
}
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
