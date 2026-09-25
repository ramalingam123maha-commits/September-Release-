<template>
  <div class="current-card">
    <div class="card-header">
      <div class="location">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <h2>{{ weather.name }}, {{ weather.sys.country }}</h2>
      </div>
      <p class="date-time">{{ formattedDate }}</p>
    </div>

    <div class="main-weather">
      <div class="temp-section">
        <img
          :src="`https://openweathermap.org/img/wn/${weather.weather[0]?.icon ?? '01d'}@4x.png`"
          :alt="weather.weather[0]?.description ?? 'weather'"
          class="weather-icon"
        />
        <div>
          <div class="temperature">{{ Math.round(weather.main.temp) }}{{ tempUnit }}</div>
          <div class="feels-like">Feels like {{ Math.round(weather.main.feels_like) }}{{ tempUnit }}</div>
          <div class="description">{{ capitalize(weather.weather[0]?.description ?? '') }}</div>
        </div>
      </div>
      <div class="temp-range">
        <span class="temp-high">↑ {{ Math.round(weather.main.temp_max) }}{{ tempUnit }}</span>
        <span class="temp-low">↓ {{ Math.round(weather.main.temp_min) }}{{ tempUnit }}</span>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a5 5 0 0 1 5 5c0 6-5 11-5 11S7 13 7 7a5 5 0 0 1 5-5z"/>
          <circle cx="12" cy="7" r="2"/>
        </svg>
        <span class="detail-label">Humidity</span>
        <span class="detail-value">{{ weather.main.humidity }}%</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
        </svg>
        <span class="detail-label">Wind</span>
        <span class="detail-value">{{ weather.wind.speed }} {{ speedUnit }}</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        </svg>
        <span class="detail-label">Pressure</span>
        <span class="detail-value">{{ weather.main.pressure }} hPa</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41"/>
        </svg>
        <span class="detail-label">Visibility</span>
        <span class="detail-value">{{ (weather.visibility / 1000).toFixed(1) }} km</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span class="detail-label">Sunrise</span>
        <span class="detail-value">{{ formatTime(weather.sys.sunrise) }}</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 10V2M4.93 10.93 2.1 8.1M19.07 10.93l2.83-2.83M22 17H2a10 10 0 1 1 20 0z"/>
        </svg>
        <span class="detail-label">Sunset</span>
        <span class="detail-value">{{ formatTime(weather.sys.sunset) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CurrentWeather } from '@/types/weather'
import { computed } from 'vue'

const props = defineProps<{
  weather: CurrentWeather
  tempUnit: string
  speedUnit: string
}>()

const formattedDate = computed(() => {
  return new Date(props.weather.dt * 1000).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.current-card {
  background: rgba(255,255,255,0.15); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.25); border-radius: 24px;
  padding: 28px; color: #fff;
}
.card-header { margin-bottom: 20px; }
.location { display: flex; align-items: center; gap: 8px; }
.location svg { width: 20px; height: 20px; flex-shrink: 0; }
.location h2 { font-size: 1.5rem; font-weight: 700; margin: 0; }
.date-time { margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 0.9rem; }
.main-weather {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px;
}
.temp-section { display: flex; align-items: center; gap: 8px; }
.weather-icon { width: 100px; height: 100px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
.temperature { font-size: 4rem; font-weight: 800; line-height: 1; }
.feels-like { font-size: 0.95rem; color: rgba(255,255,255,0.75); margin-top: 4px; }
.description { font-size: 1.1rem; font-weight: 500; margin-top: 4px; text-transform: capitalize; }
.temp-range { display: flex; flex-direction: column; gap: 4px; text-align: right; padding-top: 8px; }
.temp-high { color: #ffd580; font-weight: 600; font-size: 1.1rem; }
.temp-low { color: #90caf9; font-weight: 600; font-size: 1.1rem; }
.details-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.detail-item {
  background: rgba(255,255,255,0.1); border-radius: 14px; padding: 14px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
}
.detail-item svg { width: 22px; height: 22px; color: rgba(255,255,255,0.8); }
.detail-label { font-size: 0.75rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 1rem; font-weight: 600; }

@media (max-width: 500px) {
  .temperature { font-size: 3rem; }
  .weather-icon { width: 80px; height: 80px; }
  .details-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
