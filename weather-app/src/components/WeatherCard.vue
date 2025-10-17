<template>
  <div v-if="w" class="card">
    <div class="head">
      <div>
        <h2>{{ w.city }}, {{ w.country }}</h2>
        <p class="desc">{{ w.description }}</p>
      </div>
      <img v-if="w.icon" :src="`https://openweathermap.org/img/wn/${w.icon}@2x.png`" :alt="w.description" width="72" height="72"/>
    </div>
    <ul class="grid">
      <li><b>Hőmérséklet:</b> {{ w.temp }} °C</li>
      <li><b>Érzett:</b> {{ w.feels_like }} °C</li>
      <li><b>Páratartalom:</b> {{ w.humidity }}%</li>
      <li><b>Szél:</b> {{ w.wind }} m/s</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({ w: { type: Object, required: false } });
</script>

<style scoped>
.card { border:1px solid #e5e7eb; border-radius:16px; padding:16px; background:#fff; display:grid; gap:12px; }
.head { display:flex; align-items:center; justify-content:space-between; }
.desc { text-transform:capitalize; color:#374151; }
.grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px 16px; margin:0; padding:0; list-style:none; }
@media (max-width:540px){ .grid{ grid-template-columns:1fr; } }
</style>
