<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-toolbar color="primary" dark><v-toolbar-title>Login</v-toolbar-title></v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field v-model="email" label="Email" type="email" outlined required></v-text-field>
              <v-text-field v-model="password" label="Password" type="password" outlined required></v-text-field>
              <v-btn type="submit" color="primary" block :loading="loading">Login</v-btn>
            </v-form>
            <div class="text-center mt-4">
              <router-link to="/register">Don't have an account? Sign up</router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/main'
import { useToast } from 'vue-toastification'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    
    const handleLogin = async () => {
      loading.value = true
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        toast.success('Welcome back!')
        router.push('/')
      } catch (error) {
        toast.error('Login failed: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    return { email, password, loading, handleLogin }
  }
}
</script>
