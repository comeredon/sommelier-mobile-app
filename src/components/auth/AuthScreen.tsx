import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'
import { AuthUser } from '../../types'
import { loginUser, registerUser } from '../../lib/api'

interface AuthScreenProps {
  onSuccess: (user: AuthUser) => void
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const handleLogin = async (email: string, password: string, isNewUser: boolean = false) => {
    setIsLoading(true)
    try {
      console.log('Attempting login with:', email)
      const response = await loginUser({ email, password })
      console.log('Login response:', response)
      
      // Store the token
      if (response.token) {
        await AsyncStorage.setItem('auth-token', response.token)
      }
      
      // Create AuthUser from response
      const authUser: AuthUser = {
        id: response.user.id || response.user._id || Date.now().toString(),
        email: response.user.email,
        name: response.user.name || response.user.firstName || email.split('@')[0],
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        token: response.token,
        birthMonth: response.user.birthMonth,
        birthYear: response.user.birthYear,
        winePreferences: response.user.winePreferences
      }

      onSuccess(authUser)
    } catch (err: any) {
      console.error('Login error:', err)
      Alert.alert('Error', err?.error || err?.message || t('auth.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (email: string, password: string, birthMonth: number, birthYear: number) => {
    setIsLoading(true)
    try {
      console.log('Attempting registration with:', { email, birthMonth, birthYear })
      const response = await registerUser({ email, password, birthMonth, birthYear })
      console.log('Registration response:', response)
      
      Alert.alert('Success', t('auth.accountCreated'))
      // Auto-login the user after successful registration
      await handleLogin(email, password, true) // Mark as new user
    } catch (err: any) {
      console.error('Registration error:', err)
      Alert.alert('Error', err?.error || err?.message || t('auth.registrationFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.icon}>🍷</Text>
            <Text style={styles.title}>Sommelier</Text>
            <Text style={styles.tagline}>{t('intro.tagline')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>{t('auth.welcome')}</Text>
            <Text style={styles.welcomeDescription}>{t('auth.signInDescription')}</Text>

            {/* Tab Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  {t('auth.signIn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                  {t('auth.createAccount')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Forms */}
            <View style={styles.formContainer}>
              {activeTab === 'login' ? (
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              ) : (
                <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function LoginForm({ onSubmit, isLoading }: { 
  onSubmit: (email: string, password: string, isNewUser?: boolean) => void
  isLoading: boolean 
}) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (email && password) {
      onSubmit(email, password, false)
    }
  }

  return (
    <View style={styles.form}>
      <Input
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLoading ? t('auth.signingIn') : t('auth.signIn')}
        onPress={handleSubmit}
        disabled={isLoading || !email || !password}
        style={styles.submitButton}
      />
    </View>
  )
}

function RegisterForm({ onSubmit, isLoading }: { 
  onSubmit: (email: string, password: string, birthMonth: number, birthYear: number) => void
  isLoading: boolean 
}) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    if (password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordMismatch')
    if (!birthMonth || !birthYear) newErrors.birth = t('auth.birthRequired')
    if (!agreeToTerms) newErrors.terms = t('auth.termsRequired')

    // Age validation
    if (birthMonth && birthYear) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const age = currentYear - parseInt(birthYear)
      const birthMonthNum = parseInt(birthMonth)
      
      if (age < 18 || (age === 18 && currentMonth < birthMonthNum)) {
        newErrors.age = t('auth.ageError')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email, password, parseInt(birthMonth), parseInt(birthYear))
    }
  }

  return (
    <View style={styles.form}>
      <Input
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={errors.email}
      />
      <Input
        label={t('auth.password')}
        placeholder={t('auth.createPasswordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Input
        label={t('auth.confirmPassword')}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
      />
      
      <View style={styles.birthContainer}>
        <Input
          label={t('auth.birthMonth')}
          placeholder={t('auth.monthPlaceholder')}
          value={birthMonth}
          onChangeText={setBirthMonth}
          keyboardType="numeric"
          style={styles.birthInput}
        />
        <Input
          label={t('auth.birthYear')}
          placeholder={t('auth.yearPlaceholder')}
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="numeric"
          style={styles.birthInput}
        />
      </View>
      
      {errors.birth && <Text style={styles.errorText}>{errors.birth}</Text>}
      {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAgreeToTerms(!agreeToTerms)}
      >
        <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
          {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.checkboxTextContainer}>
          <Text style={styles.checkboxText}>
            {t('auth.termsAgreement')}{' '}
            <Text 
              style={styles.linkText}
              onPress={(e) => {
                e.stopPropagation()
                setShowTermsModal(true)
              }}
            >
              {t('auth.termsAndConditions')}
            </Text>
            {' '}and{' '}
            <Text 
              style={styles.linkText}
              onPress={(e) => {
                e.stopPropagation()
                setShowPrivacyModal(true)
              }}
            >
              Privacy Policy
            </Text>
            {'. '}{t('auth.termsDisclaimer')}
          </Text>
        </View>
      </TouchableOpacity>
      
      {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
      
      <Button
        title={isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.submitButton}
      />

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity 
              onPress={() => setShowTermsModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`By using Sommelier, you agree to the following terms:

• You must be at least 18 years old to use this service
• This app is for personal wine collection management only
• AI-generated wine advice is for informational purposes only
• We do not provide professional wine investment advice
• Drink responsibly and in accordance with local laws
• Your wine collection data belongs to you
• We may update these terms periodically

For the complete Terms of Service, please visit our website or contact us at the email provided in the app.

By creating an account, you acknowledge that you have read and agree to these terms.`}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity 
              onPress={() => setShowPrivacyModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`We collect and use your information as follows:

DATA WE COLLECT:
• Email address (for account creation)
• Birth month/year (for age verification)
• Wine collection data (names, producers, years, notes)
• Wine preferences (optional)
• Camera access (for wine label recognition only)

HOW WE USE YOUR DATA:
• Account authentication and management
• Age verification (18+ requirement)
• Personalized wine recommendations
• AI-powered wine label recognition
• Service improvement and security

DATA SHARING:
• We use Microsoft Azure OpenAI for AI features
• Your data is stored securely on Azure cloud services
• We do not sell your personal information to third parties
• Images are processed temporarily for recognition only

YOUR RIGHTS:
• Access and update your information anytime
• Delete your account and data through app settings
• Contact us for data export or deletion requests

SECURITY:
• All data encrypted in transit and at rest
• Secure authentication with industry standards
• Regular security updates and monitoring

For our complete Privacy Policy, contact us or visit our website.`}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7ed',
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c2d12',
    marginBottom: 8,
  },
  tagline: {
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#111827',
  },
  formContainer: {
    minHeight: 300,
  },
  form: {
    gap: 16,
  },
  birthContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  birthInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#7c2d12',
    borderColor: '#7c2d12',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  linkText: {
    color: '#7c2d12',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7c2d12',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
})
