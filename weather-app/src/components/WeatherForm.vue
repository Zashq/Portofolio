<template>
  <form @submit.prevent="onSubmit" class="row">
    <input v-model.trim="city" placeholder="Város (pl. Budapest)" />
    <button :disabled="loading || !city">Keresés</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
const emit = defineEmits(["search"]);
const city = ref("");
const loading = defineModel("loading", { type: Boolean, default: false });

function onSubmit() {
  if (!city.value) return;
  emit("search", city.value);
}
</script>

<style scoped>
.row{ display:flex; gap:10px; width:100%; }
input{
  flex:1; min-width:0;
  padding:12px 14px; border-radius:12px;
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color:#e7ecf5; outline:none;
}
button{
  padding:12px 16px; border-radius:12px; border:0;
  background: linear-gradient(135deg,#2563eb,#06b6d4);
  color:#fff; font-weight:600; cursor:pointer;
}
button:disabled{ opacity:.55; cursor:not-allowed; }
</style>


