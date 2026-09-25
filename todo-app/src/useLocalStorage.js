import { useState, useEffect } from 'react'

// Persist a piece of state to localStorage under the given key.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write errors (e.g. storage full or unavailable).
    }
  }, [key, value])

  return [value, setValue]
}
