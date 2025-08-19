import React from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'

// Import components
import { LanguageSelection } from '../components/LanguageSelection'
import { IntroPage } from '../components/intro/IntroPage' 
import { AuthScreen } from '../components/auth/AuthScreen'
import { ProfileSetup } from '../components/profile/ProfileSetup'
import { WelcomeComplete } from '../components/WelcomeComplete'
import { CellarView } from '../components/cellar/CellarView'
import { ChatInterface } from '../components/chat/ChatInterface'
import { ProfileView } from '../components/profile/ProfileView'

// Import types
import { AuthUser, UserProfile } from '../types'

// Navigation parameter types
export type OnboardingStackParamList = {
  Language: undefined
  Intro: undefined
  Auth: undefined
  ProfileSetup: { user: AuthUser }
  WelcomeComplete: { user: AuthUser & { profile: UserProfile } }
}

export type MainTabParamList = {
  Cellar: undefined
  Chat: { user: AuthUser & { profile?: UserProfile } }
  Profile: { user: AuthUser & { profile?: UserProfile } }
}

export type RootStackParamList = {
  Onboarding: undefined
  MainApp: { user: AuthUser & { profile?: UserProfile } }
}

const OnboardingStack = createStackNavigator<OnboardingStackParamList>()
const MainTab = createBottomTabNavigator<MainTabParamList>()
const RootStack = createStackNavigator<RootStackParamList>()

// Onboarding stack navigator
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Language"
    >
      <OnboardingStack.Screen name="Language">
        {({ navigation }) => (
          <LanguageSelection onComplete={() => navigation.navigate('Intro')} />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="Intro">
        {({ navigation }) => (
          <IntroPage onComplete={() => navigation.navigate('Auth')} />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="Auth">
        {({ navigation }) => (
          <AuthScreen onSuccess={(user) => navigation.navigate('ProfileSetup', { user })} />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="ProfileSetup">
        {({ navigation, route }) => (
          <ProfileSetup 
            user={route.params.user} 
            onComplete={(userWithProfile) => navigation.navigate('WelcomeComplete', { user: userWithProfile })} 
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="WelcomeComplete">
        {({ navigation }) => (
          <WelcomeComplete onComplete={() => navigation.replace('MainApp')} />
        )}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  )
}

// Main app tab navigator  
function MainTabNavigator({ user }: { user: AuthUser & { profile?: UserProfile } }) {
  return (
    <MainTab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = ''
          
          if (route.name === 'Cellar') {
            iconName = '🍷'
          } else if (route.name === 'Chat') {
            iconName = '💬'
          } else if (route.name === 'Profile') {
            iconName = '👤'
          }
          
          return <Text style={{ fontSize: focused ? 24 : 20 }}>{iconName}</Text>
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingVertical: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <MainTab.Screen 
        name="Cellar" 
        component={CellarView}
        options={{ tabBarLabel: 'Cellar' }}
      />
      <MainTab.Screen 
        name="Chat"
        options={{ tabBarLabel: 'Chat' }}
      >
        {() => <ChatInterface user={user} />}
      </MainTab.Screen>
      <MainTab.Screen 
        name="Profile"
        options={{ tabBarLabel: 'Profile' }}
      >
        {(props) => (
          <ProfileView 
            {...props} 
            user={user} 
            onEdit={() => {
              // Navigate to profile edit or show edit modal
              console.log('Edit profile pressed')
            }}
            onLogout={() => {
              // Handle logout - navigate back to onboarding
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              })
            }}
          />
        )}
      </MainTab.Screen>
    </MainTab.Navigator>
  )
}

// Root stack navigator
export function RootNavigator() {
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="MainApp">
          {({ route }) => <MainTabNavigator user={route.params.user} />}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
