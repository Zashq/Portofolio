import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/main'
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { useUserStore } from './user'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const loadNotifications = async () => {
    const userStore = useUserStore()
    
    if (!userStore.isAuthenticated || !userStore.user) return
    
    try {
      loading.value = true
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userStore.user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      notifications.value = []
      
      querySnapshot.forEach((doc) => {
        notifications.value.push({
          id: doc.id,
          ...doc.data()
        })
      })
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      loading.value = false
    }
  }

  const addNotification = async (notification) => {
    const userStore = useUserStore()
    
    if (!userStore.isAuthenticated || !userStore.user) return
    
    try {
      const newNotification = {
        userId: userStore.user.uid,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: false,
        timestamp: new Date().toISOString(),
        data: notification.data || {}
      }
      
      const docRef = await addDoc(collection(db, 'notifications'), newNotification)
      
      notifications.value.unshift({
        id: docRef.id,
        ...newNotification
      })
      
      // Show browser notification if enabled
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/img/icons/android-chrome-192x192.png',
          badge: '/img/icons/android-chrome-192x192.png',
          tag: docRef.id
        })
      }
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    
    if (notification) {
      notification.read = true
      
      try {
        await updateDoc(doc(db, 'notifications', notificationId), {
          read: true
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.value.filter(n => !n.read)
    
    for (const notification of unreadNotifications) {
      notification.read = true
      
      try {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  }
})
