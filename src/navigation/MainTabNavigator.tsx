import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { CellarView } from '../components/cellar/CellarView'
import { ChatInterface } from '../components/chat/ChatInterface'
import { ProfileView } from '../components/profile/ProfileView'
import { AuthUser, UserProfile } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

export type MainTabParamList = {
  Cellar: undefined
  Chat: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

interface MainTabNavigatorProps {
  user: AuthUser & { profile?: UserProfile }
  onEditProfile: () => void
  onLogout: () => void
}

export function MainTabNavigator({ user, onEditProfile, onLogout }: MainTabNavigatorProps) {
  const { t } = useLanguage()

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 25,
          paddingBottom: 8,
          paddingTop: 8,
          height: 75,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = ''
          let labelText = ''
          
          if (route.name === 'Cellar') {
            iconName = '🍷'
            labelText = t('navigation.cellar')
          } else if (route.name === 'Chat') {
            iconName = '💬'
            labelText = t('navigation.chat')
          } else if (route.name === 'Profile') {
            iconName = '👤'
            labelText = t('navigation.profile')
          }
          
          return (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'space-between',
              height: 55,
              paddingTop: 8,
              paddingBottom: 0,
              minWidth: 60
            }}>
              <Text style={{ 
                fontSize: 24,
                flex: 1,
                textAlignVertical: 'center'
              }}>
                {iconName}
              </Text>
              <Text 
                numberOfLines={1}
                style={{ 
                  fontSize: 12,
                  fontWeight: focused ? '600' : '500',
                  color: focused ? '#8b5cf6' : '#6b7280',
                  textAlign: 'center',
                  flexShrink: 0,
                  width: '100%',
                  marginBottom: 0
                }}
              >
                {labelText}
              </Text>
            </View>
          )
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: false,
      })}
      initialRouteName="Cellar"
    >
      <Tab.Screen 
        name="Cellar" 
        component={CellarView}
        options={{ tabBarLabel: 'Cellar' }}
      />
      <Tab.Screen 
        name="Chat"
        options={{ tabBarLabel: 'Chat' }}
      >
        {() => <ChatInterface user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile"
        options={{ tabBarLabel: 'Profile' }}
      >
        {() => (
          <ProfileView 
            user={user}
            onEdit={onEditProfile}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
