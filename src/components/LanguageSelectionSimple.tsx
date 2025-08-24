import React from 'react'
import { View, Text } from 'react-native'
import { SupportedLanguage } from '../types'
import { Button } from './ui/Button'
import { useLanguage } from '../contexts/LanguageContext'

interface LanguageSelectionProps {
  onComplete: () => void
}

export function LanguageSelectionSimple({ onComplete }: LanguageSelectionProps) {
  const { setLanguage } = useLanguage()

  const handleLanguageSelect = (language: SupportedLanguage) => {
    console.log('Setting language to:', language)
    setLanguage(language)
    onComplete()
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Choose Language</Text>
      <Button
        title="🇺🇸 English"
        onPress={() => handleLanguageSelect('en')}
        style={{ marginBottom: 10 }}
      />
      <Button
        title="🇫🇷 Français"
        onPress={() => handleLanguageSelect('fr')}
      />
    </View>
  )
}