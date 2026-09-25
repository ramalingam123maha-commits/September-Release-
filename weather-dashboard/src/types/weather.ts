export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  name: string
  sys: { country: string; sunrise: number; sunset: number }
  dt: number
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    temp_min: number
    temp_max: number
  }
  weather: WeatherCondition[]
  wind: { speed: number; deg: number }
  visibility: number
  clouds: { all: number }
}

export interface ForecastItem {
  dt: number
  dt_txt: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    temp_min: number
    temp_max: number
  }
  weather: WeatherCondition[]
  wind: { speed: number; deg: number }
  pop: number
}

export interface ForecastResponse {
  list: ForecastItem[]
  city: {
    name: string
    country: string
  }
}

export interface DailyForecast {
  date: string
  dayName: string
  icon: string
  description: string
  tempMax: number
  tempMin: number
  humidity: number
  windSpeed: number
  pop: number
}
