import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '../../contexts/LanguageContext'
import { updateProfile } from '../../lib/api'
import { AuthUser, UserProfile } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface ProfileSetupProps {
  user: AuthUser
  onComplete: (userWithProfile: AuthUser & { profile: UserProfile }) => void
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const { t } = useLanguage()
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(user.winePreferences || [])
  const [isLoading, setIsLoading] = useState(false)

  const wineTypes = [
    { id: 'redWines', label: t('profile.redWines') || 'Red Wines' },
    { id: 'whiteWines', label: t('profile.whiteWines') || 'White Wines' },
    { id: 'roseWines', label: t('profile.roseWines') || 'Rosé Wines' },
    { id: 'sparklingWines', label: t('profile.sparklingWines') || 'Sparkling Wines' },
    { id: 'dessertWines', label: t('profile.dessertWines') || 'Dessert Wines' },
    { id: 'fortifiedWines', label: t('profile.fortifiedWines') || 'Fortified Wines' }
  ]

  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    )
  }

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', t('profile.nameRequired') || 'Please enter your first and last name')
      return
    }

    if (selectedPreferences.length === 0) {
      Alert.alert('Error', t('profile.preferencesRequired') || 'Please select at least one wine preference')
      return
    }

    setIsLoading(true)

    try {
      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthMonth: user.birthMonth,
        birthYear: user.birthYear,
        winePreferences: selectedPreferences
      }

      // Save profile to backend database
      const updateData = {
        email: user.email, // Include email as required by backend
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        winePreferences: selectedPreferences,
        profileCompleted: true
      }

      console.log('Saving profile to database:', updateData)
      const response = await updateProfile(updateData)
      console.log('Profile saved successfully:', response)

      // Update user data in local storage
      const userWithProfile = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        winePreferences: selectedPreferences,
        profile
      }

      // Save updated user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userWithProfile))
      await AsyncStorage.setItem('profile-completed', 'true')

      console.log('Profile setup completed successfully')
      onComplete(userWithProfile)
    } catch (error) {
      console.error('Error completing profile setup:', error)
      Alert.alert('Error', t('profile.profileUpdateFailed') || 'Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>{t('profile.setup') || 'Complete Your Profile'}</Text>
          <Text style={styles.description}>
            {t('profile.setupDescription') || 'Help us personalize your wine experience'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo') || 'Personal Information'}</Text>
            
            <Input
              label={t('profile.firstName') || 'First Name'}
              placeholder={t('profile.firstNamePlaceholder') || 'Enter your first name'}
              value={firstName}
              onChangeText={setFirstName}
            />
            
            <Input
              label={t('profile.lastName') || 'Last Name'}
              placeholder={t('profile.lastNamePlaceholder') || 'Enter your last name'}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.winePreferences') || 'Wine Preferences'}</Text>
            <Text style={styles.sectionSubtitle}>
              Select the types of wines you enjoy (choose at least one)
            </Text>
            
            <View style={styles.preferencesGrid}>
              {wineTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.preferenceItem,
                    selectedPreferences.includes(type.id) && styles.preferenceItemSelected
                  ]}
                  onPress={() => togglePreference(type.id)}
                >
                  <View style={[
                    styles.preferenceCheckbox,
                    selectedPreferences.includes(type.id) && styles.preferenceCheckboxSelected
                  ]}>
                    {selectedPreferences.includes(type.id) && (
                      <Text style={styles.preferenceCheckmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.preferenceText,
                    selectedPreferences.includes(type.id) && styles.preferenceTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={isLoading ? (t('profile.saving') || 'Saving...') : (t('profile.completeSetup') || 'Complete Setup')}
            onPress={handleComplete}
            disabled={isLoading}
            style={styles.completeButton}
          />
        </View>
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
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c2d12',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#a16207',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#7c2d12',
    borderColor: '#7c2d12',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  preferencesGrid: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  preferenceItemSelected: {
    backgroundColor: '#fef7ed',
    borderColor: '#7c2d12',
  },
  preferenceCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceCheckboxSelected: {
    backgroundColor: '#7c2d12',
    borderColor: '#7c2d12',
  },
  preferenceCheckmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  preferenceText: {
    fontSize: 16,
    color: '#374151',
  },
  preferenceTextSelected: {
    color: '#7c2d12',
    fontWeight: '600',
  },
  completeButton: {
    marginTop: 16,
  },
})