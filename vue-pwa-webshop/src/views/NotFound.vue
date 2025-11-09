<template>
  <v-container>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" class="text-center py-12">
        <div class="error-animation mb-6">
          <v-icon size="200" color="primary">mdi-cart-remove</v-icon>
        </div>
        
        <h1 class="text-h1 font-weight-bold mb-4">404</h1>
        <h2 class="text-h4 mb-4">Page Not Found</h2>
        <p class="text-h6 text-grey mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>

        <v-row justify="center" class="mb-8">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search for products..."
              prepend-inner-icon="mdi-magnify"
              outlined
              hide-details
              @keyup.enter="search"
            >
              <template v-slot:append>
                <v-btn
                  icon
                  variant="text"
                  @click="search"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <div class="d-flex justify-center flex-wrap gap-4">
          <v-btn
            color="primary"
            size="large"
            to="/"
          >
            <v-icon left>mdi-home</v-icon>
            Go Home
          </v-btn>
          
          <v-btn
            color="secondary"
            size="large"
            variant="outlined"
            to="/products"
          >
            <v-icon left>mdi-shopping</v-icon>
            Browse Products
          </v-btn>
          
          <v-btn
            color="secondary"
            size="large"
            variant="outlined"
            to="/categories"
          >
            <v-icon left>mdi-shape</v-icon>
            View Categories
          </v-btn>
        </div>

        <!-- Popular Categories -->
        <v-divider class="my-8"></v-divider>
        
        <h3 class="text-h5 mb-4">Or explore these categories</h3>
        <v-row justify="center">
          <v-col
            v-for="category in popularCategories"
            :key="category.value"
            cols="6"
            sm="3"
          >
            <v-card
              hover
              class="text-center pa-4"
              @click="$router.push(`/category/${category.value}`)"
            >
              <v-icon size="48" color="primary">{{ category.icon }}</v-icon>
              <p class="mt-2 font-weight-bold">{{ category.title }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NotFoundView',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    
    const popularCategories = [
      {
        title: 'Electronics',
        value: 'electronics',
        icon: 'mdi-laptop'
      },
      {
        title: 'Jewelry',
        value: 'jewelery',
        icon: 'mdi-diamond-stone'
      },
      {
        title: "Men's Clothing",
        value: "men's clothing",
        icon: 'mdi-tshirt-crew'
      },
      {
        title: "Women's Clothing",
        value: "women's clothing",
        icon: 'mdi-hanger'
      }
    ]
    
    const search = () => {
      if (searchQuery.value) {
        router.push(`/search?q=${searchQuery.value}`)
      }
    }
    
    return {
      searchQuery,
      popularCategories,
      search
    }
  }
}
</script>

<style scoped>
.error-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.gap-4 {
  gap: 1rem;
}
</style>
