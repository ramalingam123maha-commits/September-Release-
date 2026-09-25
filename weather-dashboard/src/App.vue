<template>
  <div class="app" :class="bgClass">
    <div class="app-overlay"></div>
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
          </svg>
          <span>WeatherScope</span>
        </div>
        <button class="unit-toggle" @click="toggleUnitAndRefresh" :disabled="loading">
          {{ unit === 'metric' ? '°C → °F' : '°F → °C' }}
        </button>
      </header>

      <!-- Search -->
      <div class="search-section">
        <SearchBar :loading="loading" @search="handleSearch" @locate="handleLocate" />
      </div>

      <!-- Error -->
      <div v-if="error" class="error-box">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <!-- Loading skeleton -->
      <LoadingSkeleton v-if="loading" />

      <!-- Weather content -->
      <template v-else-if="currentWeather">
        <div class="weather-content">
          <CurrentWeatherCard
            :weather="currentWeather"
            :tempUnit="tempUnit"
            :speedUnit="speedUnit"
          />
          <ForecastCard v-if="forecast.length" :forecast="forecast" :tempUnit="tempUnit" />
        </div>
      </template>

      <!-- Empty state -->
      <div v-else-if="!error" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
          </svg>
        </div>
        <h2>Welcome to WeatherScope</h2>
        <p>Search for a city or use your location to get the current weather and 5-day forecast.</p>
        <div class="feature-pills">
          <span class="pill">🌡️ Current Weather</span>
          <span class="pill">📅 5-Day Forecast</span>
          <span class="pill">📍 Location Search</span>
          <span class="pill">💨 Wind & Humidity</span>
        </div>
      </div>

      <footer class="footer">
        <p>Powered by <a href="https://openweathermap.org" target="_blank" rel="noopener">OpenWeatherMap</a></p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import CurrentWeatherCard from '@/components/CurrentWeatherCard.vue'
import ForecastCard from '@/components/ForecastCard.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { useWeather } from '@/composables/useWeather'

const {
  currentWeather, forecast, loading, error,
  unit, tempUnit, speedUnit,
  fetchWeather, fetchByCoords, toggleUnit
} = useWeather()

const lastSearch = ref<{ type: 'city'; city: string } | { type: 'coords'; lat: number; lon: number } | null>(null)

const bgClass = computed(() => {
  if (!currentWeather.value) return 'bg-default'
  const id = currentWeather.value.weather[0]?.id ?? 800
  if (id >= 200 && id < 300) return 'bg-storm'
  if (id >= 300 && id < 600) return 'bg-rain'
  if (id >= 600 && id < 700) return 'bg-snow'
  if (id >= 700 && id < 800) return 'bg-mist'
  if (id === 800) return 'bg-clear'
  return 'bg-clouds'
})

async function handleSearch(city: string) {
  lastSearch.value = { type: 'city', city }
  await fetchWeather(city)
}

async function handleLocate() {
  if (!navigator.geolocation) {
    return
  }
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude: lat, longitude: lon } = pos.coords
      lastSearch.value = { type: 'coords', lat, lon }
      await fetchByCoords(lat, lon)
    },
    () => {
      // geolocation denied
    }
  )
}

async function toggleUnitAndRefresh() {
  toggleUnit()
  if (!lastSearch.value) return
  if (lastSearch.value.type === 'city') {
    await fetchWeather(lastSearch.value.city)
  } else {
    await fetchByCoords(lastSearch.value.lat, lastSearch.value.lon)
  }
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

.app {
  min-height: 100vh; position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  transition: background 1s ease;
}
.bg-clear { background: linear-gradient(135deg, #1565c0 0%, #0288d1 50%, #29b6f6 100%) !important; }
.bg-clouds { background: linear-gradient(135deg, #37474f 0%, #455a64 50%, #607d8b 100%) !important; }
.bg-rain { background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%) !important; }
.bg-storm { background: linear-gradient(135deg, #212121 0%, #37474f 50%, #263238 100%) !important; }
.bg-snow { background: linear-gradient(135deg, #b0bec5 0%, #cfd8dc 50%, #eceff1 100%) !important; }
.bg-mist { background: linear-gradient(135deg, #546e7a 0%, #607d8b 50%, #78909c 100%) !important; }
.bg-default { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }

.app-overlay {
  position: fixed; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%);
}
.container {
  max-width: 1000px; margin: 0 auto; padding: 24px 16px;
  position: relative; z-index: 1; min-height: 100vh;
  display: flex; flex-direction: column; gap: 28px;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
}
.logo {
  display: flex; align-items: center; gap: 10px;
  color: #fff; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;
}
.logo svg { width: 28px; height: 28px; }
.unit-toggle {
  background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.25); border-radius: 50px;
  color: #fff; padding: 8px 18px; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
}
.unit-toggle:hover:not(:disabled) { background: rgba(255,255,255,0.25); }
.unit-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
.search-section { display: flex; justify-content: center; }
.error-box {
  background: rgba(239,68,68,0.2); backdrop-filter: blur(10px);
  border: 1px solid rgba(239,68,68,0.4); border-radius: 14px;
  padding: 16px 20px; color: #fca5a5;
  display: flex; align-items: center; gap: 10px; font-size: 0.95rem;
}
.error-box svg { width: 20px; height: 20px; flex-shrink: 0; }
.weather-content { display: flex; flex-direction: column; gap: 20px; }
.empty-state {
  text-align: center; color: #fff; padding: 60px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.empty-icon svg { width: 80px; height: 80px; color: rgba(255,255,255,0.4); }
.empty-state h2 { font-size: 1.8rem; font-weight: 700; }
.empty-state p { color: rgba(255,255,255,0.65); font-size: 1rem; max-width: 400px; line-height: 1.6; }
.feature-pills { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 8px; }
.pill {
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  border-radius: 50px; padding: 8px 16px; font-size: 0.85rem; color: rgba(255,255,255,0.8);
}
.footer {
  text-align: center; color: rgba(255,255,255,0.4); font-size: 0.8rem; padding: 8px 0;
  margin-top: auto;
}
.footer a { color: rgba(255,255,255,0.6); text-decoration: none; }
.footer a:hover { color: #fff; }
</style>
