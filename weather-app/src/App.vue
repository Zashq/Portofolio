<script setup>
import { ref } from "vue";
import WeatherForm from "./components/WeatherForm.vue";
import WeatherCard from "./components/WeatherCard.vue";
import { fetchWeather } from "./services/api";

const loading = ref(false);
const error = ref("");
const data = ref(null);

async function search(city) {
  loading.value = true;
  error.value = "";
  data.value = null;
  try {
    data.value = await fetchWeather(city);
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || "Ismeretlen hiba";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="wrap">
    <div class="content">
      <h1>Weather 🔎</h1>

      <WeatherForm v-model:loading="loading" @search="search" />

      <p v-if="loading">Töltés…</p>
      <p v-if="error" class="err">Hiba: {{ error }}</p>

      <WeatherCard :w="data" />
    </div>
  </main>
</template>

<!-- Komponensre vonatkozó stílusok -->
<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;    /* vertikális közép */
  align-items: center;        /* horizontális közép */
  text-align: center;
  gap: 1rem;
  padding: 1rem;
}

h1 { margin-bottom: 1rem; }
.err { color: #b91c1c; }

.content {
  width: 100%;
  max-width: 520px;           /* picit nagyobb, hogy a kártya lélegezzen */
}
</style>

<!-- GLOBÁL stílus (nem scoped!), itt lehet body/html -->
<style>
html, body {
  height: 100%;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: #f4f6f8;
}

/* Opcionális: dark mode támogatás */
@media (prefers-color-scheme: dark) {
  body { background: #0f1216; color: #e7eaee; }
}
</style>
