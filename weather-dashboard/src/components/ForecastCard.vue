<template>
  <div class="forecast-section">
    <h3 class="section-title">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      5-Day Forecast
    </h3>
    <div class="forecast-grid">
      <div
        v-for="day in forecast"
        :key="day.date"
        class="forecast-item"
      >
        <div class="day-name">{{ day.dayName }}</div>
        <img
          :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
          :alt="day.description"
          class="forecast-icon"
        />
        <div class="forecast-desc">{{ capitalize(day.description) }}</div>
        <div class="forecast-temps">
          <span class="f-high">{{ day.tempMax }}{{ tempUnit }}</span>
          <span class="f-sep">/</span>
          <span class="f-low">{{ day.tempMin }}{{ tempUnit }}</span>
        </div>
        <div class="forecast-meta">
          <span class="meta-item" title="Humidity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            {{ day.humidity }}%
          </span>
          <span class="meta-item" title="Rain probability">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="20" y1="11" x2="4" y2="11"/>
              <path d="M5 19.5C5.5 21 6.5 22 8 22s2.5-1 3-2.5l1-5h-8l1 5.5z"/><path d="M14 19.5c.5 1.5 1.5 2.5 3 2.5s2.5-1 3-2.5l1-5h-8l1 5.5z"/>
            </svg>
            {{ day.pop }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyForecast } from '@/types/weather'

defineProps<{
  forecast: DailyForecast[]
  tempUnit: string
}>()

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.forecast-section { color: #fff; }
.section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 1.1rem; font-weight: 700; margin: 0 0 16px;
  color: rgba(255,255,255,0.9);
}
.section-title svg { width: 20px; height: 20px; }
.forecast-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.forecast-item {
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 18px;
  padding: 16px 8px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  transition: background 0.3s;
}
.forecast-item:hover { background: rgba(255,255,255,0.2); }
.day-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; }
.forecast-icon { width: 56px; height: 56px; }
.forecast-desc { font-size: 0.75rem; color: rgba(255,255,255,0.7); text-transform: capitalize; min-height: 32px; display: flex; align-items: center; justify-content: center; }
.forecast-temps { display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 0.95rem; }
.f-high { color: #ffd580; }
.f-sep { color: rgba(255,255,255,0.4); }
.f-low { color: #90caf9; }
.forecast-meta { display: flex; gap: 8px; }
.meta-item {
  display: flex; align-items: center; gap: 3px;
  font-size: 0.72rem; color: rgba(255,255,255,0.65);
}
.meta-item svg { width: 12px; height: 12px; }

@media (max-width: 700px) {
  .forecast-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 400px) {
  .forecast-grid { grid-template-columns: 1fr; }
}
</style>
