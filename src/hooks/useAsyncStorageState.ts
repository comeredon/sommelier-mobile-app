import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Custom hook that provides AsyncStorage-based persistent state management for React Native
 */
export function useAsyncStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(key)
        if (saved !== null) {
          setState(JSON.parse(saved))
        }
      } catch (error) {
        console.warn(`Failed to load state for key ${key}:`, error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadState()
  }, [key])

  useEffect(() => {
    if (!isLoaded) return

    const saveState = async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(state))
      } catch (error) {
        console.warn(`Failed to save state for key ${key}:`, error)
      }
    }

    saveState()
  }, [key, state, isLoaded])

  return [state, setState, isLoaded] as const
}
