import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLanguage } from '../contexts/LanguageContext'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'
import { AuthUser, UserProfile } from '../types'

type AppState = 
  | 'loading'
  | 'language-selection'
  | 'intro'
  | 'auth'
  | 'profile-setup'
  | 'welcome-complete'
  | 'main-app'

export function MainApp() {
  const { currentLanguage, hasSelectedLanguage } = useLanguage()
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useAsyncStorageState<AuthUser | null>('user', null)
  const [userProfile, setUserProfile] = useAsyncStorageState<UserProfile | null>('user-profile', null)
  const [hasCompletedIntro, setHasCompletedIntro] = useAsyncStorageState<boolean>('has-completed-intro', false)
  const [hasSeenWelcome, setHasSeenWelcome] = useAsyncStorageState<boolean>('has-seen-welcome', false)

  // Determine initial app state based on stored data
  useEffect(() => {
    const determineInitialState = async () => {
      try {
        // First, check if language has been selected (like web version)
        if (!hasSelectedLanguage) {
          setAppState('language-selection')
          return
        }

        // If user exists and has profile, go to main app
        if (user && userProfile) {
          setAppState('main-app')
          return
        }

        // If user exists but no profile, need profile setup
        if (user && !userProfile) {
          setAppState('profile-setup')
          return
        }

        // If no user but completed intro, show auth
        if (!user && hasCompletedIntro) {
          setAppState('auth')
          return
        }

        // Default: show intro
        setAppState('intro')
      } catch (error) {
        console.error('Error determining initial state:', error)
        setAppState('language-selection')
      }
    }

    determineInitialState()
  }, [currentLanguage, hasSelectedLanguage, user, userProfile, hasCompletedIntro])

  return (
    <View style={styles.loadingContainer}>
      <Text>App State: {appState}</Text>
      <Text>Language: {currentLanguage}</Text>
      <Text>Selected: {hasSelectedLanguage ? 'Yes' : 'No'}</Text>
      <Text>User: {user ? 'Logged in' : 'Not logged in'}</Text>
      <Text>Profile: {userProfile ? 'Has profile' : 'No profile'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef7ed',
    padding: 20,
  },
})
