import React, { createContext, useContext, ReactNode } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'
import enTranslations from '../locales/en.json'
import frTranslations from '../locales/fr.json'

type Language = 'en' | 'fr'
type TranslationKey = string

interface LanguageContextType {
  language: Language
  currentLanguage: Language
  hasSelectedLanguage: boolean
  setLanguage: (lang: Language) => void
  setHasSelectedLanguage: (selected: boolean) => void
  t: (key: TranslationKey) => string
  isLoaded: boolean
}

const translations = {
  en: enTranslations,
  fr: frTranslations
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  currentLanguage: 'en',
  hasSelectedLanguage: false,
  setLanguage: () => {},
  setHasSelectedLanguage: () => {},
  t: (key: string) => key,
  isLoaded: false
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState, isLanguageLoaded] = useAsyncStorageState<Language | null>('language', null)
  const [hasSelectedLanguage, setHasSelectedLanguageState, isSelectedLoaded] = useAsyncStorageState<boolean>('has-selected-language', false)
  
  const isLoaded = isLanguageLoaded && isSelectedLoaded
  
  // Default to 'en' if no language is selected yet, but don't persist it until user selects
  const currentLanguage = language || 'en'

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setHasSelectedLanguageState(true)
  }

  const setHasSelectedLanguage = (selected: boolean) => {
    setHasSelectedLanguageState(selected)
  }

  const t = (key: TranslationKey): string => {
    const keys = key.split('.')
    let translation: any = translations[currentLanguage]
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        // Fallback to English if key not found
        translation = translations.en
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey]
          } else {
            return key // Return the key itself if translation not found
          }
        }
        break
      }
    }
    
    return typeof translation === 'string' ? translation : key
  }

  return (
    <LanguageContext.Provider value={{ 
      language: currentLanguage, 
      currentLanguage, 
      hasSelectedLanguage: hasSelectedLanguage || false,
      setLanguage,
      setHasSelectedLanguage,
      t,
      isLoaded
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  return context
}
