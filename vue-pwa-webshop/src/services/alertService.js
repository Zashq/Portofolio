import { db, auth } from '@/main'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore'

class AlertService {
  /**
   * Create a new price alert
   */
  async createAlert(productId, productTitle, productImage, currentPrice, targetPrice) {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User must be logged in to create alerts')
      }

      // Check if user already has an alert for this product
      const existingAlerts = await this.getUserAlerts()
      const hasAlert = existingAlerts.some(alert => alert.productId === productId)
      
      if (hasAlert) {
        throw new Error('You already have an alert for this product')
      }

      const alertData = {
        userId: user.uid,
        productId: productId.toString(),
        productTitle,
        productImage,
        currentPrice,
        targetPrice,
        active: true,
        createdAt: serverTimestamp(),
        triggeredAt: null
      }

      const docRef = await addDoc(collection(db, 'priceAlerts'), alertData)
      
      return {
        id: docRef.id,
        ...alertData,
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  }

  /**
   * Get all alerts for current user
   */
  async getUserAlerts() {
    try {
      const user = auth.currentUser
      if (!user) return []

      const q = query(
        collection(db, 'priceAlerts'),
        where('userId', '==', user.uid),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const alerts = []

      querySnapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return alerts
    } catch (error) {
      console.error('Error getting user alerts:', error)
      return []
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId) {
    try {
      await deleteDoc(doc(db, 'priceAlerts', alertId))
      return true
    } catch (error) {
      console.error('Error deleting alert:', error)
      throw error
    }
  }

  /**
   * Get triggered alerts (notifications)
   */
  async getTriggeredAlerts() {
    try {
      const user = auth.currentUser
      if (!user) return []

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('type', '==', 'price_drop'),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const notifications = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        notifications.push({
          id: doc.id,
          productTitle: data.data?.productTitle || 'Product',
          oldPrice: data.data?.oldPrice || 0,
          newPrice: data.data?.newPrice || 0,
          percentDrop: data.data?.percentDrop || 0,
          createdAt: data.createdAt
        })
      })

      return notifications
    } catch (error) {
      console.error('Error getting triggered alerts:', error)
      return []
    }
  }

  /**
   * Get alert limit based on tier
   */
  getAlertLimit(tier) {
    const limits = {
      free: 3,
      premium: -1, // unlimited
      pro: -1 // unlimited
    }
    return limits[tier] || 3
  }
}

export default new AlertService()
