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
          <Text style={styles.title}>{t('welcome.setupComplete')}</Text>
          <Text style={styles.subtitle}>{t('welcome.readyToExplore')}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.whatsNext}>{t('welcome.whatsNext')}</Text>
          <Text style={styles.description}>{t('welcome.getStartedDescription')}</Text>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🍷</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('welcome.manageCellar')}</Text>
                <Text style={styles.featureDescription}>
                  {t('welcome.manageeCellarDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>👤</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('welcome.updateProfile')}</Text>
                <Text style={styles.featureDescription}>
                  {t('welcome.updateProfileDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('welcome.aiFeature')}</Text>
                <Text style={styles.featureDescription}>
                  {t('welcome.aiFeatureDescription')}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.accessNote}>{t('welcome.accessAnytime')}</Text>
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
