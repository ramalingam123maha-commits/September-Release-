import { ref, computed } from 'vue'
import type { CurrentWeather, ForecastResponse, DailyForecast } from '@/types/weather'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export function useWeather() {
  const currentWeather = ref<CurrentWeather | null>(null)
  const forecast = ref<DailyForecast[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const unit = ref<'metric' | 'imperial'>('metric')

  const tempUnit = computed(() => (unit.value === 'metric' ? '°C' : '°F'))
  const speedUnit = computed(() => (unit.value === 'metric' ? 'm/s' : 'mph'))

  async function fetchWeather(city: string) {
    if (!API_KEY) {
      error.value = 'API key not configured. Please add your OpenWeatherMap API key.'
      return
    }
    loading.value = true
    error.value = null
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${unit.value}&appid=${API_KEY}`),
        fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${unit.value}&appid=${API_KEY}`)
      ])

      if (!weatherRes.ok) {
        if (weatherRes.status === 404) throw new Error(`City "${city}" not found.`)
        if (weatherRes.status === 401) throw new Error('Invalid API key. Please check your OpenWeatherMap API key.')
        throw new Error('Failed to fetch weather data.')
      }

      currentWeather.value = await weatherRes.json() as CurrentWeather
      const forecastData: ForecastResponse = await forecastRes.json()
      forecast.value = processForecast(forecastData)
    } catch (e: any) {
      error.value = e.message || 'An unexpected error occurred.'
      currentWeather.value = null
      forecast.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchByCoords(lat: number, lon: number) {
    if (!API_KEY) {
      error.value = 'API key not configured. Please add your OpenWeatherMap API key.'
      return
    }
    loading.value = true
    error.value = null
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit.value}&appid=${API_KEY}`),
        fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit.value}&appid=${API_KEY}`)
      ])

      if (!weatherRes.ok) throw new Error('Failed to fetch weather data.')
      currentWeather.value = await weatherRes.json() as CurrentWeather
      const forecastData: ForecastResponse = await forecastRes.json()
      forecast.value = processForecast(forecastData)
    } catch (e: any) {
      error.value = e.message || 'An unexpected error occurred.'
    } finally {
      loading.value = false
    }
  }

  function processForecast(data: ForecastResponse): DailyForecast[] {
    const days = new Map<string, any[]>()
    for (const item of data.list) {
      const parts = item.dt_txt.split(' ')
      const date: string = parts[0] as string
      if (!days.has(date)) days.set(date, [])
      days.get(date)!.push(item)
    }

    const result: DailyForecast[] = []
    for (const [date, items] of days) {
      if (result.length >= 5) break
      const temps = items.map(i => i.main.temp)
      const midday = items.find(i => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)]
      result.push({
        date,
        dayName: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        icon: midday.weather[0]?.icon ?? '01d',
        description: midday.weather[0]?.description ?? '',
        tempMax: Math.round(Math.max(...temps)),
        tempMin: Math.round(Math.min(...temps)),
        humidity: Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length),
        windSpeed: Math.round(midday.wind.speed * 10) / 10,
        pop: Math.round(Math.max(...items.map(i => i.pop)) * 100)
      })
    }
    return result
  }

  function toggleUnit() {
    unit.value = unit.value === 'metric' ? 'imperial' : 'metric'
  }

  return {
    currentWeather,
    forecast,
    loading,
    error,
    unit,
    tempUnit,
    speedUnit,
    fetchWeather,
    fetchByCoords,
    toggleUnit
  }
}
