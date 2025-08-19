import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Button } from '../ui/Button'
import { recognizeWineFromImage } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

interface WineRecognitionDialogProps {
  isOpen: boolean
  onClose: () => void
  onWineRecognized: (wineData: any) => void
  onManualEntry: () => void
}

export function WineRecognitionDialog({ 
  isOpen, 
  onClose, 
  onWineRecognized,
  onManualEntry
}: WineRecognitionDialogProps) {
  const { t } = useLanguage()
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const handleUseAI = async () => {
    if (!permission) {
      // Still loading permissions
      return
    }

    if (!permission.granted) {
      // Request camera permission
      const response = await requestPermission()
      if (!response.granted) {
        Alert.alert(
          t('camera.errors.permissionDenied'),
          t('camera.allowPermissionsInstruction')
        )
        return
      }
    }

    setShowCamera(true)
  }

  const handleManualEntry = () => {
    onClose()
    onManualEntry()
  }

  const handleImageCapture = async (imageUri: string) => {
    setShowCamera(false)
    setIsProcessing(true)

    try {
      // Convert image to base64
      const response = await fetch(imageUri)
      const blob = await response.blob()
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string
          const base64Image = base64Data.split(',')[1] // Remove data:image/jpeg;base64, prefix
          
          const result = await recognizeWineFromImage(base64Image)
          
          if (result.success) {
            Alert.alert(
              t('wineRecognition.recognizedSuccess').replace('{{confidence}}', result.confidence),
              t('wineRecognition.processingSuccess'),
              [
                {
                  text: t('common.continue'),
                  onPress: () => {
                    onWineRecognized(result.wineData)
                    onClose()
                  }
                }
              ]
            )
          } else {
            Alert.alert(
              t('wineRecognition.recognitionFailed'),
              result.error || t('wineRecognition.processingFailed'),
              [
                {
                  text: t('wineRecognition.tryAgain'),
                  onPress: () => setShowCamera(true)
                },
                {
                  text: t('wineRecognition.manualEntry'),
                  onPress: handleManualEntry
                }
              ]
            )
          }
        } catch (error) {
          console.error('Wine recognition error:', error)
          Alert.alert(
            t('wineRecognition.processingFailed'),
            t('wineRecognition.tryAgainOrManual'),
            [
              {
                text: t('wineRecognition.tryAgain'),
                onPress: () => setShowCamera(true)
              },
              {
                text: t('wineRecognition.manualEntry'),
                onPress: handleManualEntry
              }
            ]
          )
        } finally {
          setIsProcessing(false)
        }
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Image processing error:', error)
      setIsProcessing(false)
      Alert.alert(
        t('wineRecognition.processingFailed'),
        t('wineRecognition.tryAgainOrManual')
      )
    }
  }

  const handleCameraClose = () => {
    setShowCamera(false)
  }

  const handleClose = () => {
    if (!isProcessing) {
      setShowCamera(false)
      onClose()
    }
  }

  return (
    <>
      <Modal
        visible={isOpen && !showCamera}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ {t('wineRecognition.title')}</Text>
              <TouchableOpacity onPress={handleClose} disabled={isProcessing}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              {t('wineRecognition.description')}
            </Text>

            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Text style={styles.processingTitle}>🍷 {t('wineRecognition.identifyingTitle')}</Text>
                <Text style={styles.processingDescription}>
                  {t('wineRecognition.identifyingDescription')}
                </Text>
                <Text style={styles.processingTime}>
                  {t('wineRecognition.identifyingTime')}
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <Button
                  title={`📸 ${t('wineRecognition.useCameraAI')}`}
                  onPress={handleUseAI}
                  style={styles.primaryButton}
                />
                <Text style={styles.buttonSubtext}>
                  {t('wineRecognition.useCameraDescription')}
                </Text>
                
                <Button
                  title={`✏️ ${t('wineRecognition.manualEntry')}`}
                  onPress={handleManualEntry}
                  style={styles.secondaryButton}
                />
                <Text style={styles.buttonSubtext}>
                  {t('wineRecognition.manualDescription')}
                </Text>
              </View>
            )}
            
            <Text style={styles.tipText}>
              {t('wineRecognition.aiTip')}
            </Text>
          </View>
        </View>
      </Modal>

      <CameraCapture
        isOpen={showCamera}
        onClose={handleCameraClose}
        onCapture={handleImageCapture}
        title={t('wineRecognition.captureTitle')}
        description={t('wineRecognition.captureDescription')}
      />
    </>
  )
}

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageUri: string) => void
  title?: string
  description?: string
}

function CameraCapture({ 
  isOpen, 
  onClose, 
  onCapture, 
  title,
  description
}: CameraCaptureProps) {
  const { t } = useLanguage()
  const [facing, setFacing] = useState<'front' | 'back'>('back')
  const [cameraRef, setCameraRef] = useState<any>(null)

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        })
        onCapture(photo.uri)
      } catch (error) {
        console.error('Error taking picture:', error)
        Alert.alert(t('camera.errors.captureFailed'))
      }
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  if (!isOpen) return null

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing={facing}
          ref={setCameraRef}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>{title || t('camera.title')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.cameraCloseButton}>
                <Text style={styles.cameraCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraInstructions}>
              <Text style={styles.instructionText}>
                🍷 {t('camera.focusOnLabel')}
              </Text>
              <Text style={styles.instructionSubtext}>
                {t('camera.makeVisible')}
              </Text>
            </View>

            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity onPress={toggleCameraFacing} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>🔄</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={takePicture}
                style={styles.captureButton}
              >
                <Text style={styles.captureButtonText}>📸</Text>
              </TouchableOpacity>
              
              <View style={styles.controlButton} />
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f1eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  processingDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  processingTime: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
    marginBottom: 8,
    marginTop: 16,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraCloseButton: {
    padding: 8,
  },
  cameraCloseText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraInstructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 60,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonText: {
    fontSize: 32,
  },
})
