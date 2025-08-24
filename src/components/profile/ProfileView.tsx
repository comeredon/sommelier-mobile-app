import React from 'react'
import { 
  View, 
  Text,
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { AuthUser, UserProfile } from '../../types'

interface ProfileViewProps {
  user: AuthUser & { profile?: UserProfile }
  onEdit: () => void
  onLogout: () => void
}

export function ProfileView({ user, onEdit, onLogout }: ProfileViewProps) {
  const { t, language, setLanguage } = useLanguage()

  const handleLogout = () => {
    Alert.alert(
      t('profile.confirmLogout'),
      t('profile.logoutWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.logout'), 
          style: 'destructive',
          onPress: onLogout
        }
      ]
    )
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en')
  }

  // Check if profile is complete using AuthUser structure
  const hasCompleteProfile = user.firstName && user.lastName && user.winePreferences && user.winePreferences.length > 0

  if (!hasCompleteProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t('profile.noProfile')}</Text>
          <Text style={styles.emptyStateText}>{t('profile.completeSetupDescription')}</Text>
          <Button
            title={t('profile.setupProfile')}
            onPress={onEdit}
            style={styles.setupButton}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <LinearGradient
      colors={['#f5f1eb', '#f0ebe4', '#ede7de']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>{t('profile.title')}</Text>
          <Text style={styles.welcomeText}>
            {t('profile.welcome')} {user.firstName || user.email}!
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('profile.firstName')}:</Text>
              <Text style={styles.value}>{user.firstName || t('profile.notProvided')}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('profile.lastName')}:</Text>
              <Text style={styles.value}>{user.lastName || t('profile.notProvided')}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('profile.email')}:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.winePreferences')}</Text>
            {user.winePreferences && user.winePreferences.length > 0 ? (
              <View style={styles.preferencesGrid}>
                {user.winePreferences.map((preference: string) => (
                  <View key={preference} style={styles.preferenceTag}>
                    <Text style={styles.preferenceText}>
                      {t(`profile.${preference}`)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.value}>{t('profile.noPreferences')}</Text>
            )}
          </View>

          <View style={styles.buttonSection}>
            <Button
              title={t('profile.editProfile')}
              onPress={onEdit}
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>
                {language === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            style={styles.logoutButton}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100, // Extra padding to avoid floating tab bar (75 + 20 + 5)
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  setupButton: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  preferenceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonSection: {
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    width: '100%',
  },
})
