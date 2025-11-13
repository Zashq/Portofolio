import { db, auth } from '@/main'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  getDoc,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore'

class AlertService {

  async createAlert(productId, productTitle, productImage, currentPrice, targetPrice) {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User must be logged in to create alerts')
      }

      console.log('Creating alert for user:', user.uid)

      const existingAlerts = await this.getUserAlerts()
      const hasAlert = existingAlerts.some(alert => alert.productId === productId.toString())
      
      if (hasAlert) {
        throw new Error('You already have an alert for this product')
      }


      const userDoc = await this.getUserSubscription()
      const alertLimit = this.getAlertLimit(userDoc?.tier || 'free')
      
      if (existingAlerts.length >= alertLimit && alertLimit !== -1) {
        throw new Error(`Alert limit reached. Upgrade to Premium for unlimited alerts.`)
      }

      const alertData = {
        userId: user.uid,
        userEmail: user.email || '',
        productId: productId.toString(),
        productTitle,
        productImage,
        currentPrice,
        targetPrice,
        active: true,
        createdAt: serverTimestamp(),
        triggeredAt: null
      }

      console.log('Creating alert with data:', alertData)
      const docRef = await addDoc(collection(db, 'priceAlerts'), alertData)
      console.log('Alert created with ID:', docRef.id)
      
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


  async getUserAlerts() {
    try {
      const user = auth.currentUser
      if (!user) {
        console.log('No user logged in')
        return []
      }

      console.log('Fetching alerts for user:', user.uid)

      try {
        const q = query(
          collection(db, 'priceAlerts'),
          where('userId', '==', user.uid),
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        )

        const querySnapshot = await getDocs(q)
        const alerts = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          alerts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
          })
        })

        console.log('Alerts fetched with orderBy:', alerts.length)
        return alerts
      } catch (indexError) {
        if (indexError.code === 'failed-precondition' || indexError.message.includes('index')) {
          console.warn('⚠️ Missing Firestore index! Falling back to simple query.')
          console.log('Create index here:', indexError.message)
          
          const simpleQuery = query(
            collection(db, 'priceAlerts'),
            where('userId', '==', user.uid),
            where('active', '==', true)
          )

          const querySnapshot = await getDocs(simpleQuery)
          const alerts = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            alerts.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            })
          })

          alerts.sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA 
          })

          console.log('Alerts fetched without orderBy:', alerts.length)
          return alerts
        } else {
          throw indexError
        }
      }
    } catch (error) {
      console.error('Error getting user alerts:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      return []
    }
  }

  async deleteAlert(alertId) {
    try {
      console.log('Deleting alert:', alertId)
      await deleteDoc(doc(db, 'priceAlerts', alertId))
      console.log('Alert deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting alert:', error)
      throw error
    }
  }

  async getTriggeredAlerts() {
    try {
      const user = auth.currentUser
      if (!user) return []

      console.log('Fetching notifications for user:', user.uid)

      try {
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
            productImage: data.data?.productImage || '',
            oldPrice: data.data?.oldPrice || 0,
            newPrice: data.data?.newPrice || 0,
            percentDrop: data.data?.percentDrop || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
          })
        })

        console.log('Notifications fetched:', notifications.length)
        return notifications
      } catch (indexError) {
        if (indexError.code === 'failed-precondition' || indexError.message.includes('index')) {
          console.warn('⚠️ Missing notifications index! Falling back to simple query.')
          
          const simpleQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('type', '==', 'price_drop')
          )

          const querySnapshot = await getDocs(simpleQuery)
          const notifications = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            notifications.push({
              id: doc.id,
              productTitle: data.data?.productTitle || 'Product',
              productImage: data.data?.productImage || '',
              oldPrice: data.data?.oldPrice || 0,
              newPrice: data.data?.newPrice || 0,
              percentDrop: data.data?.percentDrop || 0,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            })
          })

          notifications.sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA
          })

          console.log('Notifications fetched without orderBy:', notifications.length)
          return notifications
        } else {
          throw indexError
        }
      }
    } catch (error) {
      console.error('Error getting triggered alerts:', error)
      return []
    }
  }


  async getUserSubscription() {
    try {
      const user = auth.currentUser
      if (!user) return { tier: 'free' }

      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        console.log('User subscription:', data.tier || 'free')
        return {
          tier: data.tier || data.subscriptionTier || 'free',
          ...data
        }
      }

      console.log('No user document found, using free tier')
      return { tier: 'free' }
    } catch (error) {
      console.error('Error getting user subscription:', error)
      return { tier: 'free' }
    }
  }


  getAlertLimit(tier) {
    const limits = {
      free: 3,
      premium: 20,
      pro: -1 
    }
    return limits[tier] || 3
  }
}

export default new AlertService()
