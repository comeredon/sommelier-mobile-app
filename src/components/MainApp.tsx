import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LanguageSelection } from './LanguageSelection'
import { IntroPage } from './intro/IntroPage'
import { AuthScreen } from './auth/AuthScreen'
import { ProfileSetup } from './profile/ProfileSetup'
import { MainTabNavigator } from '../navigation/MainTabNavigator'
// import { WelcomeComplete } from './WelcomeComplete'
import { Loading } from './ui/Loading'
import { Button } from './ui/Button'
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
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useAsyncStorageState<UserProfile | null>('user-profile', null)
  const [hasCompletedIntro, setHasCompletedIntro] = useAsyncStorageState<boolean>('has-completed-intro', false)
  const [hasSeenWelcome, setHasSeenWelcome] = useAsyncStorageState<boolean>('has-seen-welcome', false)

  // Determine initial app state based on stored data
  useEffect(() => {
    const determineInitialState = async () => {
      try {
        console.log('determineInitialState called with:', {
          hasSelectedLanguage,
          user: user ? 'exists' : 'null',
          userProfile: userProfile ? 'exists' : 'null',
          hasCompletedIntro,
          currentAppState: appState
        })

        // First, check if language has been selected (like web version)
        if (!hasSelectedLanguage) {
          console.log('Setting state to language-selection')
          setAppState('language-selection')
          return
        }

        // If user exists and has profile, go to main app
        if (user && userProfile) {
          console.log('Setting state to main-app (user and profile exist)')
          setAppState('main-app')
          return
        }

        // If user exists but no profile, need profile setup
        if (user && !userProfile) {
          console.log('Setting state to profile-setup (user exists, no profile)')
          setAppState('profile-setup')
          return
        }

        // If no user, check if intro has been completed
        if (!user) {
          if (!hasCompletedIntro) {
            console.log('Setting state to intro (no intro completed)')
            setAppState('intro')
            return
          } else {
            console.log('Setting state to auth (intro completed, no user)')
            setAppState('auth')
            return
          }
        }

        // Fallback
        console.log('Setting state to auth (fallback)')
        setAppState('auth')
      } catch (error) {
        console.error('Error determining initial state:', error)
        setAppState('language-selection')
      }
    }

    determineInitialState()
  }, [currentLanguage, hasSelectedLanguage, user, userProfile, hasCompletedIntro])

    const handleLanguageSelected = () => {
    // After language selection, check if intro has been completed
    if (!hasCompletedIntro) {
      setAppState('intro')
    } else {
      setAppState('auth')
    }
  }

  const handleIntroComplete = () => {
    setHasCompletedIntro(true)
    setAppState('auth')
  }

  const handleAuthSuccess = (authUser: AuthUser) => {
    console.log('handleAuthSuccess called with user:', authUser)
    try {
      setUser(authUser)
      console.log('setUser completed')
      
      // Check if user already has profile data
      const hasProfile = authUser.firstName || authUser.lastName || (authUser.winePreferences && authUser.winePreferences.length > 0)
      
      if (hasProfile) {
        // User already has profile data, create profile object and skip profile setup
        const existingProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          birthMonth: authUser.birthMonth,
          birthYear: authUser.birthYear,
          winePreferences: authUser.winePreferences,
          experienceLevel: 'intermediate' // Default value
        }
        setUserProfile(existingProfile)
        console.log('User has existing profile, skipping profile setup')
      }
      
      setIsLoading(true)
      console.log('setIsLoading completed')
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error)
    }
  }

  const handleProfileComplete = (userWithProfile: AuthUser & { profile: UserProfile }) => {
    setUserProfile(userWithProfile.profile)
    if (!hasSeenWelcome) {
      setAppState('welcome-complete')
    } else {
      setAppState('main-app')
    }
  }

  const handleWelcomeComplete = () => {
    setHasSeenWelcome(true)
    setAppState('main-app')
  }

  const handleLogout = async () => {
    setUser(null)
    setUserProfile(null)
    setHasSeenWelcome(false)
    await AsyncStorage.multiRemove(['user', 'user-profile', 'has-seen-welcome'])
    setAppState('auth')
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Loading text="Loading..." />
        </View>
      </SafeAreaView>
    )
  }

  // Language selection
  if (appState === 'language-selection') {
    return <LanguageSelection onComplete={handleLanguageSelected} />
  }

  // Intro/onboarding
  if (appState === 'intro') {
    return <IntroPage onComplete={handleIntroComplete} />
  }

  // Authentication
  if (appState === 'auth') {
    return <AuthScreen onSuccess={handleAuthSuccess} />
  }

  // Profile setup
  if (appState === 'profile-setup' && user) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />
  }

  // Welcome screen (first time only)
  if (appState === 'welcome-complete' && user && userProfile) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Loading text="Welcome Loading..." />
        </View>
      </SafeAreaView>
    )
  }

  // Main app with navigation
  if (appState === 'main-app' && user && userProfile) {
    return (
      <View style={styles.fullContainer}>
        <MainTabNavigator 
          user={{ ...user, profile: userProfile }} 
          onEditProfile={() => setAppState('profile-setup')}
          onLogout={handleLogout}
        />
      </View>
    )
  }

  // Fallback loading state
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.loadingContainer}>
        <Loading text="Loading..." />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
})
