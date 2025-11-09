<template>
  <v-card
    class="product-card h-100"
    @click="$router.push(`/product/${product.id}`)"
  >
    <v-img
      :src="product.image"
      :alt="product.title"
      height="200"
      cover
      class="product-image"
    >
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey-lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
      
      <!-- Sale Badge -->
      <v-chip
        v-if="isOnSale"
        color="error"
        class="ma-2 position-absolute"
        style="top: 0; right: 0;"
      >
        -{{ salePercentage }}%
      </v-chip>
    </v-img>

    <v-card-title class="text-subtitle-1">
      {{ truncatedTitle }}
    </v-card-title>

    <v-card-subtitle>
      <v-chip size="x-small" color="primary" variant="outlined">
        {{ product.category }}
      </v-chip>
    </v-card-subtitle>

    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-rating
          :model-value="product.rating?.rate || 4"
          color="amber"
          density="compact"
          half-increments
          readonly
          size="small"
        ></v-rating>
        <span class="text-caption ml-2">
          ({{ product.rating?.count || 0 }})
        </span>
      </div>
      
      <div class="price-section">
        <span v-if="isOnSale" class="text-decoration-line-through text-grey mr-2">
          ${{ originalPrice }}
        </span>
        <span class="text-h6 font-weight-bold">
          ${{ currentPrice }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn
        color="primary"
        variant="outlined"
        block
        @click.stop="addToCart"
      >
        <v-icon left>mdi-cart-plus</v-icon>
        Add to Cart
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import { useCartStore } from '@/store/cart'
import { useToast } from 'vue-toastification'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const cartStore = useCartStore()
    const toast = useToast()
    
    const truncatedTitle = computed(() => {
      const maxLength = 50
      if (props.product.title.length > maxLength) {
        return props.product.title.substring(0, maxLength) + '...'
      }
      return props.product.title
    })
    
    // Simulate sale logic
    const isOnSale = computed(() => {
      // Random sale for demo (in production, this would come from backend)
      return props.product.id % 3 === 0
    })
    
    const salePercentage = computed(() => {
      if (!isOnSale.value) return 0
      return Math.floor(Math.random() * 30) + 10 // 10-40% off
    })
    
    const originalPrice = computed(() => {
      return props.product.price.toFixed(2)
    })
    
    const currentPrice = computed(() => {
      if (isOnSale.value) {
        const discounted = props.product.price * (1 - salePercentage.value / 100)
        return discounted.toFixed(2)
      }
      return originalPrice.value
    })
    
    const addToCart = async () => {
      const result = await cartStore.addItem({
        ...props.product,
        price: parseFloat(currentPrice.value)
      })
      
      if (result.success) {
        toast.success(`${props.product.title} added to cart`)
      } else {
        toast.error('Failed to add item to cart')
      }
    }
    
    return {
      truncatedTitle,
      isOnSale,
      salePercentage,
      originalPrice,
      currentPrice,
      addToCart
    }
  }
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.product-image {
  object-fit: contain;
  padding: 10px;
  background: white;
}

.price-section {
  display: flex;
  align-items: center;
}

.position-absolute {
  position: absolute !important;
}
</style>
