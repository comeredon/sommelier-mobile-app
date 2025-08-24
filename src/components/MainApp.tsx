import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useLanguage } from '../contexts/LanguageContext'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'
import { MainTabNavigator } from '../navigation/MainTabNavigator'
import { AuthScreen } from './auth/AuthScreen'
import { IntroPage } from './intro/IntroPage'
import { LanguageSelection } from './LanguageSelection'
import { ProfileSetup } from './profile/ProfileSetup'
import { Loading } from './ui/Loading'
import { WelcomeComplete } from './WelcomeComplete'

export function MainApp() {
  const { t, language, isLoaded } = useLanguage()
  const [currentScreen, setCurrentScreen] = useAsyncStorageState('currentScreen', 'language')
  const [hasSeenIntro, setHasSeenIntro] = useAsyncStorageState('has-seen-intro', false)
  const [user, setUser] = useAsyncStorageState<any>('user', null)
  const [profileCompleted, setProfileCompleted] = useAsyncStorageState('profile-completed', false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check for stored auth token on app startup
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('auth-token')
        const storedUser = await AsyncStorage.getItem('user')
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('Found stored auth token and user data, validating...')
          
          // If we have stored user data, set it and proceed
          setUser(userData)
          
          // Check if profile is complete
          const hasCompleteProfile = userData.firstName && 
            userData.lastName && 
            userData.winePreferences && 
            userData.winePreferences.length > 0
          
          if (hasCompleteProfile) {
            setProfileCompleted(true)
            setCurrentScreen('main-app')
          } else {
            setProfileCompleted(false)
            setCurrentScreen('profile-setup')
          }
        } else {
          console.log('No stored auth found, starting fresh')
          setCurrentScreen('language')
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
        setCurrentScreen('language')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    if (isLoaded) {
      checkAuthState()
    }
  }, [isLoaded])

  // Debug logging
  console.log('MainApp state:', {
    currentScreen,
    hasSeenIntro,
    user: user ? { 
      email: user.email, 
      id: user.id, 
      firstName: user.firstName,
      lastName: user.lastName,
      hasWinePrefs: !!user.winePreferences?.length 
    } : null,
    profileCompleted,
    language,
    isLoaded
  })

  useEffect(() => {
    if (!isLoaded || isCheckingAuth) {
      console.log('Language context not loaded or checking auth, waiting...')
      return
    }

    // Determine the correct screen based on state
    console.log('Determining correct screen based on state...')
    
    if (!currentScreen || currentScreen === 'language') {
      console.log('No current screen or on language screen, staying on language')
      return
    }

    // Check if the current user actually has a completed profile
    const userHasCompleteProfile = user && user.firstName && user.lastName && user.winePreferences && user.winePreferences.length > 0

    // If user is editing profile, allow them to stay on profile-setup
    if (isEditingProfile && currentScreen === 'profile-setup') {
      console.log('User is editing profile, staying on profile setup')
      return
    }

    // If user exists but profile is not completed, go to profile setup
    if (user && (!profileCompleted || !userHasCompleteProfile)) {
      console.log('User exists but profile not completed, redirecting to profile setup')
      setCurrentScreen('profile-setup')
      return
    }

    // If user exists and profile is completed, go to main app
    if (user && profileCompleted && userHasCompleteProfile) {
      console.log('User exists and profile completed, redirecting to main app')
      setCurrentScreen('main-app')
      return
    }

    // Additional state debugging
    console.log('Current navigation state is appropriate')
  }, [isLoaded, isCheckingAuth, currentScreen, hasSeenIntro, user, profileCompleted])

  if (!isLoaded || isCheckingAuth) {
    return <Loading text={isCheckingAuth ? "Checking authentication..." : "Loading..."} />
  }

  const renderCurrentScreen = () => {
    console.log('Rendering screen:', currentScreen)
    
    switch (currentScreen) {
      case 'language':
        return (
          <LanguageSelection 
            onComplete={() => {
              console.log('Language selection completed, moving to intro')
              setCurrentScreen('intro')
            }} 
          />
        )
      
      case 'intro':
        return (
          <IntroPage 
            onComplete={() => {
              console.log('Intro completed, moving to auth')
              setCurrentScreen('auth')
              setHasSeenIntro(true)
            }}
          />
        )
      
      case 'auth':
        return (
          <AuthScreen 
            onSuccess={async (userData) => {
              console.log('Auth success, user:', userData)
              
              // Check if profile is complete using direct properties on AuthUser
              const hasCompleteProfile = userData.firstName && 
                userData.lastName && 
                userData.winePreferences && 
                userData.winePreferences.length > 0

              console.log('Profile complete?', hasCompleteProfile)
              
              // If profile is not complete, ensure profileCompleted flag is reset
              if (!hasCompleteProfile) {
                console.log('Profile incomplete, resetting profileCompleted flag')
                await setProfileCompleted(false)
              }
              
              setUser(userData)
              
              // Navigate based on profile completion
              if (hasCompleteProfile) {
                setCurrentScreen('main')
              } else {
                setCurrentScreen('profile-setup')
              }
            }}
          />
        )
      
      case 'profile-setup':
        if (!user) {
          console.log('No user for profile setup, redirecting to auth')
          setCurrentScreen('auth')
          return null
        }
        return (
          <ProfileSetup 
            user={user}
            onComplete={(userWithProfile) => {
              console.log('Profile setup completed, updating user data')
              setUser(userWithProfile)
              setProfileCompleted(true)
              
              // If editing existing profile, go back to main app
              if (isEditingProfile) {
                console.log('Editing profile completed, returning to main app')
                setIsEditingProfile(false)
                setCurrentScreen('main-app')
              } else {
                // If first-time setup, show welcome complete
                setCurrentScreen('welcome-complete')
              }
            }}
          />
        )
      
      case 'welcome-complete':
        return (
          <WelcomeComplete 
            onComplete={() => {
              console.log('Welcome completed, going to main app')
              setCurrentScreen('main-app')
            }}
          />
        )
      
      case 'main-app':
        if (!user) {
          console.log('No user for main app, redirecting to auth')
          setCurrentScreen('auth')
          return null
        }
        return (
          <MainTabNavigator 
            user={user}
            onEditProfile={() => {
              console.log('Edit profile requested')
              setIsEditingProfile(true)
              setCurrentScreen('profile-setup')
            }}
            onLogout={async () => {
              console.log('Logout requested')
              // Clear stored auth token
              await AsyncStorage.removeItem('auth-token')
              setUser(null)
              setProfileCompleted(false)
              setCurrentScreen('language')
            }}
          />
        )
      
      default:
        console.log('Unknown screen, defaulting to language selection')
        return (
          <LanguageSelection 
            onComplete={() => {
              console.log('Language selection completed (default), moving to intro')
              setCurrentScreen('intro')
            }} 
          />
        )
    }
  }

  return (
    <SafeAreaProvider>
      {renderCurrentScreen()}
    </SafeAreaProvider>
  )
}