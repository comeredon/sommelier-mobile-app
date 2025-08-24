import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Wine, WineType } from '../../types'
import { updateWine } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { WineTypePicker } from './WineTypePicker'

interface WineDetailModalProps {
  visible: boolean
  wine: Wine | null
  onClose: () => void
  onUpdate: (updatedWine: Wine) => void
}

export function WineDetailModal({ visible, wine, onClose, onUpdate }: WineDetailModalProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    producer: '',
    year: '',
    type: 'red' as WineType,
    region: '',
    notes: '',
    rating: '',
    price: '',
  })

  useEffect(() => {
    if (wine) {
      setFormData({
        name: wine.name || '',
        producer: wine.producer || '',
        year: wine.year?.toString() || '',
        type: wine.type || 'red',
        region: wine.region || '',
        notes: wine.notes || '',
        rating: wine.rating?.toString() || '',
        price: wine.price?.toString() || '',
      })
      setIsEditing(false)
    }
  }, [wine])

  const getWineTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'red':
        return '#dc2626'
      case 'white':
        return '#fbbf24'
      case 'rosé':
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

  const handleSave = async () => {
    if (!wine) return

    try {
      setLoading(true)

      const updateData = {
        name: formData.name.trim(),
        producer: formData.producer.trim(),
        year: parseInt(formData.year) || wine.year,
        type: formData.type,
        region: formData.region.trim(),
        notes: formData.notes.trim(),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
      }

      const response = await updateWine(wine.id, updateData)

      // Check if the response is the updated wine object (has id property)
      if (response && response.id) {
        const updatedWine = { ...wine, ...updateData }
        onUpdate(updatedWine)
        setIsEditing(false)
        Alert.alert(t('success'), t('cellar.wineUpdated'))
      } else {
        console.error('Update failed with response:', response)
        Alert.alert(t('error'), response.error || t('cellar.updateFailed'))
      }
    } catch (error) {
      console.error('Error updating wine:', error)
      Alert.alert(t('error'), t('cellar.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (wine) {
      setFormData({
        name: wine.name || '',
        producer: wine.producer || '',
        year: wine.year?.toString() || '',
        type: wine.type || 'red',
        region: wine.region || '',
        notes: wine.notes || '',
        rating: wine.rating?.toString() || '',
        price: wine.price?.toString() || '',
      })
    }
    setIsEditing(false)
  }

  if (!wine) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? t('cellar.editWine') : t('cellar.wineDetails')}
          </Text>
          <TouchableOpacity 
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={loading}
            style={styles.actionButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#7c2d12" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isEditing ? t('save') : t('edit')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.wineHeader}>
            <View 
              style={[
                styles.typeIndicator, 
                { backgroundColor: getWineTypeColor(formData.type) }
              ]} 
            />
            <View style={styles.headerInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t('cellar.wineName')}
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.wineName}>{wine.name}</Text>
              )}
              {isEditing ? (
                <TextInput
                  style={styles.producerInput}
                  value={formData.producer}
                  onChangeText={(text) => setFormData({ ...formData, producer: text })}
                  placeholder={t('cellar.producer')}
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.wineProducer}>{wine.producer}</Text>
              )}
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.year')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={formData.year}
                  onChangeText={(text) => setFormData({ ...formData, year: text })}
                  placeholder="2020"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.detailValue}>{wine.year}</Text>
              )}
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.type')}</Text>
              {!isEditing && (
                <Text style={styles.detailValue}>{wine.type}</Text>
              )}
            </View>

            {isEditing && (
              <View style={styles.wineTypeSection}>
                <WineTypePicker
                  selectedType={formData.type}
                  onSelect={(type) => setFormData({ ...formData, type })}
                  disabled={loading}
                />
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.region')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={formData.region}
                  onChangeText={(text) => setFormData({ ...formData, region: text })}
                  placeholder={t('cellar.region')}
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.detailValue}>{wine.region || '—'}</Text>
              )}
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.rating')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={formData.rating}
                  onChangeText={(text) => setFormData({ ...formData, rating: text })}
                  placeholder="4.5"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.detailValue}>
                  {wine.rating ? `${wine.rating}/5` : '—'}
                </Text>
              )}
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.price')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="25.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.detailValue}>
                  {wine.price ? `$${wine.price}` : '—'}
                </Text>
              )}
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('cellar.addedDate')}</Text>
              <Text style={styles.detailValue}>
                {new Date(wine.addedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {(wine.notes || isEditing) && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>{t('cellar.notes')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.notesInput}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder={t('cellar.addNotes')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.notesText}>{wine.notes || '—'}</Text>
              )}
            </View>
          )}

          {isEditing && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#7c2d12',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  wineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 6,
    height: 60,
    borderRadius: 3,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  wineProducer: {
    fontSize: 18,
    color: '#6b7280',
  },
  producerInput: {
    fontSize: 18,
    color: '#6b7280',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  detailsGrid: {
    backgroundColor: 'white',
    marginBottom: 12,
    paddingVertical: 8,
  },
  wineTypeSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  detailInput: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
  },
  notesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  notesInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
})