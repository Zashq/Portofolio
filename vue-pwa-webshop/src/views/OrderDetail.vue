<template>
  <v-container>
    <h1 class="text-h3 mb-4">Order Details</h1>
    <v-card>
      <v-card-text>
        <p>Order #{{ $route.params.id }}</p>
        <p>Order details will appear here</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'OrderDetailView'
}
</script>
