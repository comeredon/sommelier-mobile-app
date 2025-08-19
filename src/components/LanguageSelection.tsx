import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SupportedLanguage } from '../types'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardDescription } from './ui/Card'
import { useLanguage } from '../contexts/LanguageContext'

interface LanguageSelectionProps {
  onComplete: () => void
}

export function LanguageSelection({ onComplete }: LanguageSelectionProps) {
  const { setLanguage } = useLanguage()

  const handleLanguageSelect = (language: SupportedLanguage) => {
    // Store the language selection and proceed
    console.log('Setting language to:', language)
    setLanguage(language)
    onComplete()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.title}>🍷 Sommelier</Text>
            <Text style={styles.subtitle}>Your Personal AI Wine Companion</Text>
          </View>

          {/* Beta Message */}
          <Card style={styles.betaCard}>
            <CardContent style={styles.betaContent}>
              <Text style={styles.betaTitle}>🚀 Beta Access</Text>
              <Text style={styles.betaMessage}>
                This application is currently in beta and you have early access. 
                Thank you for being part of our journey to create the perfect AI sommelier experience!
              </Text>
              <Text style={styles.betaThanks}>
                Thank you for your feedback!
              </Text>
            </CardContent>
          </Card>

          {/* Language Selection Card */}
          <Card style={styles.languageCard}>
            <CardHeader style={styles.languageHeader}>
              <CardDescription style={styles.languageDescription}>
                Choose your language for your AI Sommelier experience
              </CardDescription>
              <CardDescription style={styles.languageDescription}>
                Choisissez votre langue pour votre expérience Sommelier IA
              </CardDescription>
            </CardHeader>
            <CardContent style={styles.languageContent}>
              <View style={styles.buttonContainer}>
                <Button
                  title="🇺🇸 English"
                  onPress={() => handleLanguageSelect('en')}
                  variant="default"
                  size="lg"
                  style={styles.languageButton}
                  textStyle={styles.languageButtonText}
                />
                <Button
                  title="🇫🇷 Français"
                  onPress={() => handleLanguageSelect('fr')}
                  variant="default"
                  size="lg"
                  style={styles.languageButton}
                  textStyle={styles.languageButtonText}
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefbf3', // Light gradient background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7c2d12',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6b7280',
    textAlign: 'center',
  },
  betaCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    borderWidth: 1,
  },
  betaContent: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  betaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  betaMessage: {
    fontSize: 14,
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 20,
  },
  betaThanks: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  languageHeader: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  languageDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  languageContent: {
    padding: 20,
    paddingTop: 0,
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  languageButton: {
    width: 200,
    minHeight: 60,
  },
  languageButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
})
