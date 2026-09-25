<template>
  <div class="search-bar">
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="search-input-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Search city..."
          class="search-input"
          :disabled="loading"
          autocomplete="off"
        />
        <button v-if="query" type="button" class="clear-btn" @click="query = ''" aria-label="Clear">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <button type="submit" class="search-btn" :disabled="loading || !query.trim()">
        <span v-if="!loading">Search</span>
        <span v-else class="spinner"></span>
      </button>
      <button type="button" class="location-btn" @click="$emit('locate')" :disabled="loading" title="Use my location" aria-label="Use my location">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ loading: boolean }>()
const emit = defineEmits<{
  search: [city: string]
  locate: []
}>()

const query = ref('')

function handleSearch() {
  const trimmed = query.value.trim()
  if (trimmed) emit('search', trimmed)
}
</script>

<style scoped>
.search-bar { width: 100%; max-width: 600px; margin: 0 auto; }
.search-form { display: flex; gap: 8px; align-items: center; }
.search-input-wrapper {
  flex: 1; position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 14px; width: 18px; height: 18px;
  color: rgba(255,255,255,0.5); pointer-events: none;
}
.search-input {
  width: 100%; padding: 12px 40px 12px 42px;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.25); border-radius: 50px;
  color: #fff; font-size: 15px; outline: none; transition: all 0.3s;
}
.search-input::placeholder { color: rgba(255,255,255,0.5); }
.search-input:focus { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }
.search-input:disabled { opacity: 0.6; cursor: not-allowed; }
.clear-btn {
  position: absolute; right: 12px; background: none; border: none;
  color: rgba(255,255,255,0.6); cursor: pointer; padding: 2px;
  display: flex; align-items: center; transition: color 0.2s;
}
.clear-btn svg { width: 16px; height: 16px; }
.clear-btn:hover { color: #fff; }
.search-btn {
  padding: 12px 24px; background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3); border-radius: 50px;
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; white-space: nowrap; min-width: 90px;
  display: flex; align-items: center; justify-content: center;
}
.search-btn:hover:not(:disabled) { background: rgba(255,255,255,0.3); }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.location-btn {
  padding: 12px; background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25); border-radius: 50px;
  color: #fff; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center;
}
.location-btn svg { width: 20px; height: 20px; }
.location-btn:hover:not(:disabled) { background: rgba(255,255,255,0.25); }
.location-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
