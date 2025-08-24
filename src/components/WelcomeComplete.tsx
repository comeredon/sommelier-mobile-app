import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { Button } from './ui/Button'
import { useLanguage } from '../contexts/LanguageContext'

interface WelcomeCompleteProps {
  onComplete: () => void
}

export function WelcomeComplete({ onComplete }: WelcomeCompleteProps) {
  const { t } = useLanguage()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>{t('welcome.title') || 'Welcome!'}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle') || 'Your profile is all set up'}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.whatsNext}>{t('welcome.description') || "You're ready to start building your wine collection and getting personalized recommendations."}</Text>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🍷</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{'Manage Your Cellar'}</Text>
                <Text style={styles.featureDescription}>
                  {'Track your wine collection and get insights'}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>👤</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{'Profile & Preferences'}</Text>
                <Text style={styles.featureDescription}>
                  {'Update your preferences anytime'}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{'AI Sommelier'}</Text>
                <Text style={styles.featureDescription}>
                  {'Get personalized wine recommendations'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.accessNote}>{'You can access all features from the main navigation'}</Text>
        </View>

        <Button
          title={t('welcome.startExploring')}
          onPress={onComplete}
          style={styles.startButton}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7ed',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c2d12',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a16207',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  whatsNext: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 24,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  accessNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#7c2d12',
    paddingVertical: 16,
  },
})
