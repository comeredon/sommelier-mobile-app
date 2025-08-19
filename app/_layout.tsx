import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import { MainApp } from '../src/components/MainApp'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={['#f0f0e6', '#e6ddd4', '#d4c5b4', '#c4b59e']}
        style={styles.fullScreenContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LanguageProvider>
          <MainApp />
          <StatusBar style="dark" backgroundColor="transparent" translucent />
        </LanguageProvider>
      </LinearGradient>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
})
