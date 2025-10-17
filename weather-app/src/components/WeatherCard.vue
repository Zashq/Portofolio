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
.card{
  width: 100%;
  border-radius:16px; padding:16px; display:grid; gap:12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0,0,0,.25);
  transition: transform .15s, box-shadow .15s, background .15s;
}
.card:hover{ transform: translateY(-2px); box-shadow:0 18px 42px rgba(0,0,0,.35); background: rgba(255,255,255,0.10); }

.head{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
h2{ margin:0 0 4px; color:#e9eef8; }
.desc{ margin:0; text-transform:capitalize; color:#a8b3c7; }

.grid{
  display:grid; grid-template-columns: repeat(2, minmax(0,1fr));
  gap:10px 16px; margin:0; padding:0; list-style:none; color:#d2d9e6;
}
.grid b{ color:#9fb2d1; font-weight:600; }
@media (max-width:540px){ .grid{ grid-template-columns:1fr; } }
</style>


