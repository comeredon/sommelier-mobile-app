import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLanguage } from '../contexts/LanguageContext'

export function MainAppTest() {
  const { currentLanguage, hasSelectedLanguage } = useLanguage()
  
  return (
    <View style={styles.container}>
      <Text>Test App - Language: {currentLanguage}</Text>
      <Text>Has Selected: {hasSelectedLanguage ? 'Yes' : 'No'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef7ed',
  },
})
