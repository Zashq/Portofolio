<template>
  <v-container>
    <h1 class="text-h3 mb-4">Analytics</h1>
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">mdi-cart</v-icon>
            <h3 class="text-h4 mt-2">0</h3>
            <p>Total Orders</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="success">mdi-currency-usd</v-icon>
            <h3 class="text-h4 mt-2">$0.00</h3>
            <p>Total Spent</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AnalyticsView'
}
</script>
