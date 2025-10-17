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
  <main class="page">
    <div class="bg"></div>

    <section class="container">
      <header class="topbar"><h1>Weather 🔎</h1></header>

      <div class="grid">
        <section class="panel">
          <WeatherForm v-model:loading="loading" @search="search" />
          <p v-if="loading" class="muted">Töltés…</p>
          <p v-if="error" class="err">Hiba: {{ error }}</p>
        </section>

        <section class="panel">
          <WeatherCard :w="data" />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page{ min-height:100svh; min-height:100dvh; min-height:100vh; position:relative; overflow:hidden; }
.bg{
  position:absolute; inset:0;
  background:
    radial-gradient(1200px 600px at -10% -10%, #4f46e5 15%, transparent 60%),
    radial-gradient(1000px 500px at 110% 10%, #06b6d4 15%, transparent 60%),
    radial-gradient(900px 600px at 50% 110%, #22c55e 12%, transparent 60%),
    linear-gradient(180deg,#0b1220 0%,#0e1626 60%,#0b1220 100%);
  filter: blur(20px) saturate(110%); opacity:.55; pointer-events:none;
}
.container{ position:relative; z-index:1; width:min(1400px, 100% - 48px); margin-inline:auto; padding:24px 0 40px; }
.topbar{ display:flex; justify-content:center; margin-bottom:16px; }
.topbar h1{ margin:0; color:#e7ecf5; }
.grid{ display:grid; gap:20px; grid-template-columns:repeat(auto-fit, minmax(360px,1fr)); align-items:start; }
.panel{
  width:100%; border-radius:16px; padding:16px;
  background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); backdrop-filter:blur(10px);
  box-shadow:0 10px 28px rgba(0,0,0,.22);
}
.muted{ color:#a8b3c7; } .err{ color:#fda4af; }
</style>

<style>
html, body, #app { height:100%; }
*{ box-sizing:border-box; }
body{ margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:#dbe7ff; background:#0b1220; }
</style>
