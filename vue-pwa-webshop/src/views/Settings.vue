<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Settings</h1>
        <p class="text-subtitle-1 text-grey">Manage your app preferences</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <!-- Display Settings (LOCKED) -->
        <v-card class="mb-4">
          <v-card-title>Display Settings</v-card-title>
          <v-card-text>
            <v-select
              v-model="settings.theme"
              :items="['light', 'dark', 'auto']"
              label="Theme"
              outlined
              dense
              disabled
            />
            <v-select
              v-model="settings.language"
              :items="['English', 'Spanish', 'French', 'German']"
              label="Language"
              outlined
              dense
              disabled
            />
            <p class="text-caption text-grey mt-2">
              (Not configurable yet)
            </p>
          </v-card-text>
        </v-card>

        <!-- Notification Settings (LOCKED) -->
        <v-card class="mb-4">
          <v-card-title>Notifications</v-card-title>
          <v-card-text>
            <v-switch
              v-model="settings.emailNotifications"
              label="Email Notifications"
              color="primary"
              hide-details
              class="mb-2"
              disabled
            />
            <v-switch
              v-model="settings.pushNotifications"
              label="Push Notifications"
              color="primary"
              hide-details
              class="mb-2"
              disabled
            />
            <v-switch
              v-model="settings.orderUpdates"
              label="Order Status Updates"
              color="primary"
              hide-details
              class="mb-2"
              disabled
            />
            <v-switch
              v-model="settings.priceAlerts"
              label="Price Drop Alerts"
              color="primary"
              hide-details
              class="mb-2"
              disabled
            />
            <v-switch
              v-model="settings.newsletter"
              label="Newsletter & Promotions"
              color="primary"
              hide-details
              disabled
            />
            <p class="text-caption text-grey mt-2">
              (Notification settings not implemented yet)
            </p>
          </v-card-text>
        </v-card>

        <!-- Privacy Settings (LOCKED) -->
        <v-card class="mb-4">
          <v-card-title>Privacy</v-card-title>
          <v-card-text>
            <v-switch
              v-model="settings.personalizedAds"
              label="Personalized Recommendations"
              color="primary"
              hide-details
              class="mb-2"
              disabled
            />
            <v-switch
              v-model="settings.dataCollection"
              label="Usage Data Collection"
              color="primary"
              hide-details
              disabled
            />

            <v-divider class="my-4" />

            <v-btn variant="text" color="error" disabled>
              <v-icon left>mdi-download</v-icon>
              Download My Data (coming soon)
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Account Management -->
        <v-card class="mb-4">
          <v-card-title>Account Management</v-card-title>
          <v-card-text>
            <v-btn
              color="error"
              variant="outlined"
              block
              class="mb-2"
              :loading="deleting"
              @click="onDeleteAccount"
            >
              <v-icon left>mdi-delete-forever</v-icon>
              Delete Account
            </v-btn>
            <p class="text-caption text-grey text-center">
              This action cannot be undone
            </p>
          </v-card-text>
        </v-card>

        <!-- Save Button (LOCKED) -->
        <v-btn
          color="primary"
          size="large"
          :loading="false"
          disabled
        >
          <v-icon left>mdi-content-save</v-icon>
          Save Settings (not implemented)
        </v-btn>
      </v-col>

      <!-- Info Sidebar -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>App Information</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>1.0.0</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Build</v-list-item-title>
                <v-list-item-subtitle>2025.01.01</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Support</v-card-title>
          <v-card-text>
            <v-btn variant="outlined" block class="mb-2" disabled>
              <v-icon left>mdi-help-circle</v-icon>
              Help Center (coming soon)
            </v-btn>
            <v-btn variant="outlined" block class="mb-2" disabled>
              <v-icon left>mdi-file-document</v-icon>
              Terms of Service
            </v-btn>
            <v-btn variant="outlined" block disabled>
              <v-icon left>mdi-shield-check</v-icon>
              Privacy Policy
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { auth, functions } from '@/main'
import { httpsCallable } from 'firebase/functions'
import { signOut, deleteUser } from 'firebase/auth'

export default {
  name: 'SettingsView',
  setup () {
    const toast = useToast()
    const router = useRouter()

    const settings = ref({
      theme: 'light',
      language: 'English',
      emailNotifications: true,
      pushNotifications: true,
      orderUpdates: true,
      priceAlerts: true,
      newsletter: false,
      personalizedAds: true,
      dataCollection: true
    })

    const deleting = ref(false)

    const onDeleteAccount = async () => {
      if (!auth.currentUser) {
        toast.error('You must be logged in')
        return
      }

      const confirmed = window.confirm(
        'Are you sure you want to permanently delete your account and all related data?'
      )
      if (!confirmed) return

      deleting.value = true
      try {
        const fn = httpsCallable(functions, 'deleteUserAccount')
        await fn()

        try {
          await deleteUser(auth.currentUser)
        } catch (e) {
          console.warn('Client deleteUser failed (probably already deleted):', e.message)
        }

        try {
          await signOut(auth)
        } catch (e) {
          // err
        }

        toast.success('Your account has been deleted')
        router.push('/login') 
      } catch (error) {
        console.error('Delete account error:', error)
        toast.error('Failed to delete account. Please try again.')
      } finally {
        deleting.value = false
      }
    }

    return {
      settings,
      deleting,
      onDeleteAccount
    }
  }
}
</script>
