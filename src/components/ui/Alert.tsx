import React from 'react'
import { Modal, View, Text, StyleSheet } from 'react-native'
import { Button } from './Button'

export interface AlertProps {
  visible: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

export function Alert({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'info'
}: AlertProps) {
  const showCancel = !!onCancel

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, styles[`title_${type}`]]}>{title}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.footer}>
            {showCancel && (
              <Button
                title={cancelText}
                onPress={onCancel!}
                variant="outline"
                style={styles.button}
              />
            )}
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={type === 'error' ? 'destructive' : 'default'}
              style={{
                ...styles.button,
                ...(showCancel ? styles.buttonSpacing : {})
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 400,
    width: '100%',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  title_info: {
    color: '#111827',
  },
  title_success: {
    color: '#059669',
  },
  title_warning: {
    color: '#d97706',
  },
  title_error: {
    color: '#dc2626',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    justifyContent: 'flex-end',
  },
  button: {
    minWidth: 80,
  },
  buttonSpacing: {
    marginLeft: 12,
  },
})
