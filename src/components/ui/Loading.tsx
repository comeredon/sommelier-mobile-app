import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

export interface LoadingProps {
  text?: string
  size?: 'small' | 'large'
  color?: string
}

export function Loading({ text, size = 'large', color = '#7c2d12' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
})
