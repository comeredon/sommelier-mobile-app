import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { WineRecognitionDialog } from './WineRecognitionDialog'
import { WineListItem } from './WineListItem'
import { WineDetailModal } from './WineDetailModal'
import { WineTypePicker } from './WineTypePicker'
import { useLanguage } from '../../contexts/LanguageContext'
import { Wine, WineType } from '../../types'
import { getWines, addWine as addWineAPI, deleteWine } from '../../lib/api'

export function CellarView() {
  const { t } = useLanguage()
  const [wines, setWines] = useState<Wine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showWineRecognition, setShowWineRecognition] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [showWineDetail, setShowWineDetail] = useState(false)

  // Fetch wines from backend on component mount
  useEffect(() => {
    loadWines()
  }, [])

  const loadWines = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching wines from backend...')
      const response = await getWines()
      console.log('Wines response:', response)
      setWines(response.wines || response || [])
    } catch (error) {
      console.error('Error fetching wines:', error)
      Alert.alert('Error', 'Failed to load wines from server')
      setWines([]) // Fallback to empty array
    } finally {
      setIsLoading(false)
    }
  }

  const [newWine, setNewWine] = useState({
    name: '',
    producer: '',
    year: '',
    type: 'red' as WineType,
    region: '',
    notes: ''
  })

  const addWine = async () => {
    if (!newWine.name.trim() || !newWine.producer.trim()) {
      Alert.alert('Error', t('cellar.fillNameProducer'))
      return
    }

    try {
      console.log('Adding wine to backend:', newWine)
      
      const wineData = {
        name: newWine.name.trim(),
        producer: newWine.producer.trim(),
        year: parseInt(newWine.year) || new Date().getFullYear(),
        type: newWine.type,
        region: newWine.region.trim(),
        notes: newWine.notes.trim()
      }

      const response = await addWineAPI(wineData)
      console.log('Add wine response:', response)

      const addedWine = {
        id: response.id || Date.now().toString(),
        ...wineData,
        addedDate: new Date().toISOString()
      }

      setWines(prev => [addedWine, ...prev])
      
      // Reset form
      setNewWine({
        name: '',
        producer: '',
        year: '',
        type: 'red' as WineType,
        region: '',
        notes: ''
      })
      setShowAddForm(false)
      Alert.alert('Success', t('cellar.wineAdded'))

    } catch (error) {
      console.error('Error adding wine:', error)
      Alert.alert('Error', 'Failed to add wine to server')
    }
  }

  const handleWineRecognized = (wineData: any) => {
    // Pre-fill the form with recognized wine data
    setNewWine({
      name: wineData.name || '',
      producer: wineData.producer || '',
      year: wineData.year?.toString() || '',
      type: wineData.type || 'red',
      region: wineData.region || '',
      notes: wineData.notes || ''
    })
    setShowWineRecognition(false)
    setShowAddForm(true)
  }

  const handleManualEntry = () => {
    setShowWineRecognition(false)
    setShowAddForm(true)
  }

  const handleDeleteWine = async (wine: Wine) => {
    // Show confirmation dialog with wine name
    Alert.alert(
      t('cellar.confirmDelete'),
      t('cellar.deleteConfirmation').replace('{{wineName}}', wine.name),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting wine from backend:', wine.id)
              await deleteWine(wine.id)
              
              // Remove wine from local state
              setWines(prev => prev.filter(w => w.id !== wine.id))
              
              Alert.alert('Success', t('cellar.wineDeleted'))
            } catch (error) {
              console.error('Error deleting wine:', error)
              Alert.alert('Error', t('cellar.deleteFailed'))
            }
          },
        },
      ]
    )
  }

  const handleAddWinePress = () => {
    setShowWineRecognition(true)
  }

  const handleWinePress = (wine: Wine) => {
    setSelectedWine(wine)
    setShowWineDetail(true)
  }

  const handleWineUpdate = (updatedWine: Wine) => {
    setWines(prevWines => 
      prevWines.map(wine => 
        wine.id === updatedWine.id ? updatedWine : wine
      )
    )
    // Update the selected wine to reflect changes in the modal
    setSelectedWine(updatedWine)
  }

  const handleCloseWineDetail = () => {
    setShowWineDetail(false)
    setSelectedWine(null)
  }  

  // Get sort option label for display
  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case 'name': return t('cellar.sortOptions.name')
      case 'year-newest': return t('cellar.sortOptions.yearNewest')
      case 'year-oldest': return t('cellar.sortOptions.yearOldest')
      case 'producer': return t('cellar.sortOptions.producer')
      case 'added': return t('cellar.sortOptions.added')
      default: return t('cellar.sortOptions.name')
    }
  }

  // Sort options for the modal
  const sortOptions = [
    { value: 'name', label: t('cellar.sortOptions.name') },
    { value: 'year-newest', label: t('cellar.sortOptions.yearNewest') },
    { value: 'year-oldest', label: t('cellar.sortOptions.yearOldest') },
    { value: 'producer', label: t('cellar.sortOptions.producer') },
    { value: 'added', label: t('cellar.sortOptions.added') },
  ]

  // Filter and sort wines based on search query and sort option
  const filteredWines = wines
    .filter((wine: Wine) => {
      const matchesSearch = wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wine.producer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'year-newest':
          return b.year - a.year
        case 'year-oldest':
          return a.year - b.year
        case 'producer':
          return a.producer.localeCompare(b.producer)
        case 'added':
          return new Date(b.addedDate || '').getTime() - new Date(a.addedDate || '').getTime()
        default:
          return 0
      }
    })

  if (showAddForm) {
    return (
      <LinearGradient
        colors={['#f5f1eb', '#f0ebe4', '#ede7de']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('cellar.addNewWine')}</Text>
            <TouchableOpacity onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Input
              label={t('cellar.wineName')}
              placeholder={t('cellar.wineNamePlaceholder')}
              value={newWine.name}
              onChangeText={(text) => setNewWine({ ...newWine, name: text })}
            />
            
            <Input
              label={t('cellar.producer')}
              placeholder={t('cellar.producerPlaceholder')}
              value={newWine.producer}
              onChangeText={(text) => setNewWine({ ...newWine, producer: text })}
            />
            
            <Input
              label={t('cellar.year')}
              placeholder={t('cellar.yearPlaceholder')}
              value={newWine.year}
              onChangeText={(text) => setNewWine({ ...newWine, year: text })}
              keyboardType="numeric"
            />
            
            <View style={styles.wineTypeContainer}>
              <Text style={styles.wineTypeLabel}>{t('cellar.type')}</Text>
              <WineTypePicker
                selectedType={newWine.type}
                onSelect={(type: WineType) => setNewWine({ ...newWine, type })}
              />
            </View>
            
            <Input
              label={t('cellar.region')}
              placeholder={t('cellar.regionPlaceholder')}
              value={newWine.region}
              onChangeText={(text) => setNewWine({ ...newWine, region: text })}
            />
            
            <Input
              label={t('cellar.notes')}
              placeholder={t('cellar.notesPlaceholder')}
              value={newWine.notes}
              onChangeText={(text) => setNewWine({ ...newWine, notes: text })}
              multiline
              numberOfLines={3}
            />
            
            <Button
              title={t('cellar.addWine')}
              onPress={addWine}
              style={styles.addButton}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#f5f1eb', '#f0ebe4', '#ede7de']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your cellar...</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{t('cellar.yourCellar')}</Text>
              <TouchableOpacity 
                style={styles.addButtonHeader}
                onPress={handleAddWinePress}
              >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('cellar.searchWines')}
            placeholderTextColor="#000000"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>{t('cellar.sortBy')}</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>{getSortLabel(sortBy)}</Text>
            <Text style={styles.sortButtonArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{wines.length}</Text>
              <Text style={styles.statLabel}>{t('cellar.stats.totalWines')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{wines.length > 0 ? Math.min(...wines.map(w => w.year)) : new Date().getFullYear()}</Text>
              <Text style={styles.statLabel}>Plus Ancien</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{wines.length > 0 ? Math.max(...wines.map(w => w.year)) : new Date().getFullYear()}</Text>
              <Text style={styles.statLabel}>Plus Récent</Text>
            </View>
          </View>
        </View>

        <View style={styles.winesList}>
          {filteredWines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {wines.length === 0 ? t('cellar.empty.noCellar') : t('cellar.empty.noMatches')}
              </Text>
              <Text style={styles.emptyStateText}>
                {wines.length === 0 
                  ? t('cellar.empty.startCollection') 
                  : t('cellar.empty.adjustSearch')
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredWines}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WineListItem
                  wine={item}
                  onPress={handleWinePress}
                  onDelete={handleDeleteWine}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
          </>
        )}
      </SafeAreaView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('cellar.sortBy')}</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSortBy(option.value)
                  setShowSortModal(false)
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <WineRecognitionDialog
        isOpen={showWineRecognition}
        onClose={() => setShowWineRecognition(false)}
        onWineRecognized={handleWineRecognized}
        onManualEntry={handleManualEntry}
      />

      <WineDetailModal
        visible={showWineDetail}
        wine={selectedWine}
        onClose={handleCloseWineDetail}
        onUpdate={handleWineUpdate}
      />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButtonHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c2d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelButton: {
    fontSize: 20,
    color: '#6b7280',
    paddingHorizontal: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    borderWidth: 2, // Thicker border for better visibility (matches chat)
    borderColor: '#000000', // Black border for better visibility (matches chat)
    borderRadius: 20, // Rounded like chat input
    paddingHorizontal: 16, // Same padding as chat
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000', // Black text (matches chat)
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    flex: 0.31,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c2d12',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  winesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingVertical: 8,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  wineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wineCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  wineTypeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 60,
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  wineProducer: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  wineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  wineYear: {
    fontSize: 14,
    color: '#7c2d12',
    fontWeight: '600',
  },
  wineType: {
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  wineRegion: {
    fontSize: 14,
    color: '#374151',
  },
  wineNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  sortButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  sortButtonArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#7c2d12',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  pickerContainer: {
    flex: 1,
  },
  picker: {
    height: 40,
    color: '#374151',
  },
  pickerItem: {
    fontSize: 16,
    color: '#374151',
  },
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c2d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  wineTypeContainer: {
    marginBottom: 16,
  },
  wineTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
})
