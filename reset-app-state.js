// Script to reset app state for testing
// This will clear AsyncStorage data when the app starts

console.log('🧹 Resetting app state for fresh testing...')

// Add this to your app to reset storage
const resetInstructions = `
To reset the app state, add this code temporarily to your MainApp.tsx:

import AsyncStorage from '@react-native-async-storage/async-storage'

// Add this in MainApp component:
useEffect(() => {
  const resetForTesting = async () => {
    await AsyncStorage.clear()
    console.log('🧹 App state cleared for testing')
  }
  resetForTesting()
}, [])
`

console.log(resetInstructions)