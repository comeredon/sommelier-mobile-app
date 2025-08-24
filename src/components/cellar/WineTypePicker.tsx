import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { WineType } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'

interface WineTypePickerProps {
  selectedType: WineType | string
  onSelect: (type: WineType) => void
  disabled?: boolean
}

const wineTypes: WineType[] = ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified']

const getWineTypeColor = (type: WineType): string => {
  switch (type) {
    case 'red':
      return '#dc2626'
    case 'white':
      return '#fbbf24'
    case 'rose':
      return '#ec4899'
    case 'sparkling':
      return '#10b981'
    case 'dessert':
      return '#8b5cf6'
    case 'fortified':
      return '#f97316'
    default:
      return '#6b7280'
  }
}

export function WineTypePicker({ selectedType, onSelect, disabled = false }: WineTypePickerProps) {
  const { t } = useLanguage()

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {wineTypes.map((type) => {
          const isSelected = selectedType === type
          const color = getWineTypeColor(type)
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeOption,
                isSelected && styles.typeOptionSelected,
                { borderColor: color },
                isSelected && { backgroundColor: color + '15' },
                disabled && styles.typeOptionDisabled
              ]}
              onPress={() => !disabled && onSelect(type)}
              disabled={disabled}
            >
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: color }
                ]} 
              />
              <Text 
                style={[
                  styles.typeText,
                  isSelected && styles.typeTextSelected,
                  { color: isSelected ? color : '#374151' },
                  disabled && styles.typeTextDisabled
                ]}
              >
                {t(`cellar.wineTypes.${type}`)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    marginHorizontal: 4,
    minWidth: 80,
  },
  typeOptionSelected: {
    borderWidth: 2,
  },
  typeOptionDisabled: {
    opacity: 0.5,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeTextSelected: {
    fontWeight: '600',
  },
  typeTextDisabled: {
    color: '#9ca3af',
  },
})