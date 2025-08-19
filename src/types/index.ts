// Core User Types - Primary interface for authenticated users
export interface AuthUser {
  id: string
  email: string
  name?: string // Display name derived from email or provided
  firstName?: string
  lastName?: string
  token?: string // Authentication token
  birthMonth?: number
  birthYear?: number
  winePreferences?: string[]
}

// Legacy User interface for backward compatibility with web version
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  birthMonth?: number
  birthYear?: number
  winePreferences?: string[]
}

// Enhanced user profile for detailed preferences
export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  birthMonth?: number
  birthYear?: number
  winePreferences?: string[]
  region?: string
  preferredStyles?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  allergies?: string[]
  preferredPriceRange?: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

// Wine preference types
export type WineExperience = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type BudgetRange = 'budget' | 'mid-range' | 'premium' | 'luxury'
export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
export type FlavorProfile = 'bold' | 'smooth' | 'fruity' | 'earthy' | 'spicy' | 'sweet'

// Wine types
export interface Wine {
  id: string
  name: string
  producer: string
  year: number
  type: WineType
  region?: string
  notes?: string
  rating?: number
  price?: number
  addedDate: string
  imageUrl?: string
}

// Chat types
export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: string
  wineRecommendations?: WineRecommendation[]
}

export interface WineRecommendation {
  id: string
  name: string
  producer: string
  year?: number
  type: WineType
  region?: string
  price?: string
  description: string
  rating?: number
  imageUrl?: string
  purchaseUrl?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Navigation types
export type RootStackParamList = {
  LanguageSelection: undefined
  Intro: undefined
  Auth: undefined
  ProfileSetup: undefined
  WelcomeComplete: undefined
  MainApp: undefined
  CellarView: undefined
  ChatInterface: undefined
  ProfileView: undefined
}

export type NavigationRoutes = {
  LanguageSelection: undefined
  Intro: undefined
  Auth: { defaultTab?: 'login' | 'register' }
  ProfileSetup: { user: User }
  WelcomeComplete: undefined
  MainApp: undefined
}

// App state types
export type AppScreen = 
  | 'language'
  | 'intro'
  | 'auth'
  | 'profile-setup'
  | 'welcome-complete'
  | 'main-app'

export interface AppState {
  currentScreen: AppScreen
  isAuthenticated: boolean
  user: AuthUser | null
  profile: UserProfile | null
  onboardingCompleted: boolean
}

// Storage Keys (for AsyncStorage)
export const STORAGE_KEYS = {
  CURRENT_SCREEN: 'currentScreen',
  USER: 'user',
  USER_PROFILE: 'userProfile',
  LANGUAGE: 'sommelier-language',
  HAS_SEEN_INTRO: 'has-seen-intro',
  CAME_FROM_INTRO: 'came-from-intro',
  PROFILE_COMPLETED: 'profile-completed',
  WINES: 'wines',
  CHAT_HISTORY: 'chat-history',
  AUTH_TOKEN: 'auth-token',
} as const

// Language Types
export type SupportedLanguage = 'en' | 'fr'

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  flag: string
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

export interface ProfileFormData {
  firstName?: string
  lastName?: string
  birthMonth?: number
  birthYear?: number
  winePreferences?: string[]
  region?: string
  preferredStyles?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  allergies?: string[]
  preferredPriceRange?: string
}

export interface WineFormData {
  name: string
  producer: string
  year: number
  type?: string
  region?: string
  notes?: string
  rating?: number
  price?: number
  quantity?: number
  isWishlist?: boolean
}

// Component Prop Types
export interface BaseComponentProps {
  className?: string
  style?: any
}

export interface NavigationProps {
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
}

// Constants for wine preferences
export const WINE_TYPES = [
  'red',
  'white', 
  'rosé',
  'sparkling',
  'dessert',
  'fortified'
] as const

export const WINE_STYLES = [
  'dry',
  'sweet',
  'crisp',
  'full-bodied',
  'light',
  'fruity',
  'earthy',
  'mineral',
  'oak-aged',
  'fresh'
] as const

export const EXPERIENCE_LEVELS = [
  'beginner',
  'intermediate', 
  'advanced'
] as const

export const PRICE_RANGES = [
  'under-20',
  '20-50',
  '50-100',
  '100-200',
  'over-200'
] as const
