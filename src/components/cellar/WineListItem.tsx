import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Wine } from '../../types'

interface WineListItemProps {
  wine: Wine
  onPress: (wine: Wine) => void
  onDelete: (wine: Wine) => void
}

const getWineTypeColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'red':
      return '#dc2626' // Red
    case 'white':
      return '#fbbf24' // Amber/Yellow for white wine
    case 'rosé':
    case 'rose':
      return '#ec4899' // Pink
    case 'sparkling':
      return '#10b981' // Green
    case 'dessert':
      return '#8b5cf6' // Purple
    case 'fortified':
      return '#f97316' // Orange
    default:
      return '#6b7280' // Gray
  }
}

export function WineListItem({ wine, onPress, onDelete }: WineListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(wine)}>
      <View style={styles.content}>
        <View 
          style={[
            styles.typeIndicator, 
            { backgroundColor: getWineTypeColor(wine.type || '') }
          ]} 
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{wine.name}</Text>
          <Text style={styles.producer} numberOfLines={1}>{wine.producer}</Text>
          <Text style={styles.year}>{wine.year}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation()
            onDelete(wine)
          }}
        >
          <Text style={styles.deleteButtonText}>−</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  producer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  year: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c2d12',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})