<template>
  <v-container>
    <!-- Hero Section -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-carousel
          cycle
          height="400"
          hide-delimiters
          show-arrows="hover"
        >
          <v-carousel-item
            v-for="(slide, i) in slides"
            :key="i"
            :src="slide.src"
            cover
          >
            <div class="d-flex fill-height justify-center align-center">
              <div class="text-center">
                <h1 class="text-h2 font-weight-bold text-white mb-4">
                  {{ slide.title }}
                </h1>
                <p class="text-h5 text-white">
                  {{ slide.subtitle }}
                </p>
                <v-btn
                  class="mt-4"
                  color="primary"
                  size="large"
                  @click="$router.push('/products')"
                >
                  Shop Now
                </v-btn>
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>

    <!-- Featured Categories -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Shop by Category</h2>
      </v-col>
      <v-col
        v-for="category in categories"
        :key="category"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          class="category-card"
          @click="$router.push(`/category/${category}`)"
        >
          <v-card-text class="text-center py-8">
            <v-icon size="48" color="primary">
              {{ getCategoryIcon(category) }}
            </v-icon>
            <h3 class="text-h6 mt-4 text-capitalize">
              {{ category }}
            </h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Featured Products -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Featured Products</h2>
      </v-col>
      <v-col
        v-for="product in featuredProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="3"
      >
        <ProductCard :product="product" />
      </v-col>
    </v-row>

    <!-- Special Offers Banner -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card color="primary" dark>
          <v-card-text class="text-center py-8">
            <v-icon size="48">mdi-sale</v-icon>
            <h2 class="text-h4 mt-4">Special Offers</h2>
            <p class="text-h6 mt-2">
              Get up to 50% off on selected items!
            </p>
            <v-btn
              class="mt-4"
              color="white"
              variant="outlined"
              @click="$router.push('/products?sale=true')"
            >
              View Deals
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Why Shop With Us</h2>
      </v-col>
      <v-col
        v-for="feature in features"
        :key="feature.title"
        cols="12"
        md="4"
      >
        <v-card flat>
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">
              {{ feature.icon }}
            </v-icon>
            <h3 class="text-h6 mt-4">{{ feature.title }}</h3>
            <p class="mt-2">{{ feature.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Newsletter Subscription -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="48" color="primary">mdi-email-newsletter</v-icon>
            <h2 class="text-h4 mt-4">Stay Updated</h2>
            <p class="mt-2">Subscribe to our newsletter for exclusive offers and updates</p>
            <v-row justify="center" class="mt-4">
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="email"
                  label="Enter your email"
                  outlined
                  append-inner-icon="mdi-send"
                  @click:append-inner="subscribe"
                  @keyup.enter="subscribe"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/store/products'
import { useToast } from 'vue-toastification'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'HomeView',
  components: {
    ProductCard
  },
  setup() {
    const productsStore = useProductsStore()
    const toast = useToast()
    
    const email = ref('')
    
    const slides = ref([
      {
        src: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        title: 'Welcome to VueShop',
        subtitle: 'Your one-stop shop for everything'
      },
      {
        src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
        title: 'New Arrivals',
        subtitle: 'Check out our latest products'
      },
      {
        src: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
        title: 'Special Offers',
        subtitle: 'Save big on selected items'
      }
    ])
    
    const features = ref([
      {
        icon: 'mdi-truck-delivery',
        title: 'Free Shipping',
        description: 'Free delivery on orders over €50'
      },
      {
        icon: 'mdi-shield-check',
        title: 'Secure Payment',
        description: 'Your payment information is safe with us'
      },
      {
        icon: 'mdi-replay',
        title: '30-Day Returns',
        description: 'Not satisfied? Return within 30 days'
      }
    ])
    
    const categories = computed(() => productsStore.categories)
    const featuredProducts = computed(() => productsStore.featuredProducts)
    
    const getCategoryIcon = (category) => {
      const icons = {
        'electronics': 'mdi-laptop',
        'jewelery': 'mdi-diamond-stone',
        "men's clothing": 'mdi-tshirt-crew',
        "women's clothing": 'mdi-hanger'
      }
      return icons[category] || 'mdi-tag'
    }
    
    const subscribe = () => {
      if (!email.value) {
        toast.error('Please enter your email')
        return
      }
      
      if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Please enter a valid email')
        return
      }
      
      toast.success('Successfully subscribed to newsletter!')
      email.value = ''
    }
    
    onMounted(async () => {
      await Promise.all([
        productsStore.loadProducts(),
        productsStore.loadCategories()
      ])
    })
    
    return {
      email,
      slides,
      features,
      categories,
      featuredProducts,
      getCategoryIcon,
      subscribe
    }
  }
}
</script>

<style scoped>
.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
</style>
