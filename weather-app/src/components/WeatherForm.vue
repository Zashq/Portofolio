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
.row { display:flex; gap:8px; }
input { flex:1; padding:10px 12px; border:1px solid #e5e7eb; border-radius:12px; }
button { padding:10px 14px; border-radius:12px; background:#111827; color:#fff; border:0; }
button:disabled { opacity:.5; }
</style>
