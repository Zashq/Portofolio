<template>
  <v-container>
    <h1 class="text-h3 mb-4">My Profile</h1>
    <v-card>
      <v-card-text>
        <p>Email: {{ user?.email || 'Not logged in' }}</p>
        <p>Profile management coming soon</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

export default {
  name: 'ProfileView',
  setup() {
    const userStore = useUserStore()
    const user = computed(() => userStore.user)
    return { user }
  }
}
</script>
