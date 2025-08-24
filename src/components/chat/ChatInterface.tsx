import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '../../contexts/LanguageContext'
import { AuthUser } from '../../types'
import { chatWithAI } from '../../lib/api'

interface ChatInterfaceProps {
  user: AuthUser
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const { t } = useLanguage()
  
  // Ensure initial message is always a string
  const welcomeMessage = t('chat.welcome')
  console.log('Welcome message type:', typeof welcomeMessage, 'value:', welcomeMessage)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: typeof welcomeMessage === 'string' ? welcomeMessage : 'Hello! I\'m your AI sommelier. Ask me anything about wines!',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Defensive cleanup on component mount - ensure all messages have string text
  useEffect(() => {
    setMessages(prevMessages => 
      prevMessages.map(message => ({
        ...message,
        text: typeof message.text === 'string' ? message.text : String(message.text)
      }))
    )
  }, [])

  // Helper function to safely format any AI response to a string
  const formatResponseToString = (response: any): string => {
    if (typeof response === 'string') {
      return response
    }
    
    if (response && typeof response === 'object') {
      // Handle structured response with primaryRecommendation and explanation
      if (response.primaryRecommendation && response.explanation) {
        // Handle case where primaryRecommendation is an object
        let recommendationText = ''
        if (typeof response.primaryRecommendation === 'string') {
          recommendationText = response.primaryRecommendation
        } else if (response.primaryRecommendation && typeof response.primaryRecommendation === 'object') {
          // Extract meaningful text from the recommendation object
          if (response.primaryRecommendation.reasoning) {
            recommendationText = response.primaryRecommendation.reasoning
          } else if (response.primaryRecommendation.wineName && response.primaryRecommendation.producer) {
            recommendationText = `I recommend the ${response.primaryRecommendation.wineName} by ${response.primaryRecommendation.producer}`
            if (response.primaryRecommendation.year) {
              recommendationText += ` (${response.primaryRecommendation.year})`
            }
          } else {
            // Try to extract any string values from the object
            const values = Object.values(response.primaryRecommendation).filter(val => typeof val === 'string')
            recommendationText = values.length > 0 ? values.join(' - ') : 'Wine recommendation available'
          }
        }
        
        return `${recommendationText}\n\n${response.explanation}`
      } else if (response.primaryRecommendation) {
        // Handle case where only primaryRecommendation exists
        if (typeof response.primaryRecommendation === 'string') {
          return response.primaryRecommendation
        } else if (response.primaryRecommendation && typeof response.primaryRecommendation === 'object') {
          if (response.primaryRecommendation.reasoning) {
            return response.primaryRecommendation.reasoning
          } else if (response.primaryRecommendation.wineName && response.primaryRecommendation.producer) {
            let text = `I recommend the ${response.primaryRecommendation.wineName} by ${response.primaryRecommendation.producer}`
            if (response.primaryRecommendation.year) {
              text += ` (${response.primaryRecommendation.year})`
            }
            return text
          }
        }
        return String(response.primaryRecommendation)
      } else if (response.explanation) {
        return String(response.explanation)
      } else {
        // If object doesn't have expected keys, try to extract any string values
        const values = Object.values(response).filter(val => typeof val === 'string')
        return values.length > 0 ? values.join('\n\n') : 'I received a response but couldn\'t parse it properly.'
      }
    }
    
    // Last resort - convert anything to string
    return String(response)
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputText
    setInputText('')
    setIsLoading(true)

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }))

      // Call the real AI API
      const response = await chatWithAI(messageText, conversationHistory)
      
      console.log('AI Response received:', response)
      
      // Use the helper function to safely format any response to a string
      let responseText = ''
      if (response && response.response) {
        responseText = formatResponseToString(response.response)
      } else if (response) {
        responseText = formatResponseToString(response)
      } else {
        responseText = 'I apologize, but I encountered an issue processing your request. Please try again.'
      }
      
      console.log('Final response text:', responseText)
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error: any) {
      console.error('AI chat error:', error)
      
      // Show user-friendly error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble connecting to the wine advisor service right now. Please try again in a moment.',
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      // Optional: Show alert for critical errors
      if (error?.error) {
        Alert.alert('Connection Error', 'Unable to reach wine advisor service. Please check your internet connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    const welcomeMessage = t('chat.welcome')
    setMessages([
      {
        id: '1',
        text: typeof welcomeMessage === 'string' ? welcomeMessage : 'Hello! I\'m your AI sommelier. Ask me anything about wines!',
        isUser: false,
        timestamp: new Date()
      }
    ])
  }

  return (
    <LinearGradient
      colors={['#f5f1eb', '#f0ebe4', '#ede7de']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('chat.title')}</Text>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>{t('chat.clearChat')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.content} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
                ]}
              >
                <View
                  style={[
                    styles.message,
                    message.isUser ? styles.userMessage : styles.aiMessage
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.aiMessageText
                    ]}
                  >
                    {typeof message.text === 'string' ? message.text : '[Invalid message format]'}
                  </Text>
                </View>
              </View>
            ))}
            
            {isLoading && (
              <View style={styles.aiMessageWrapper}>
                <View style={styles.aiMessage}>
                  <Text style={styles.aiMessageText}>{t('chat.thinking')}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chat.placeholder')}
              placeholderTextColor="#000000"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>{t('chat.send')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#7c2d12', // Wine red to match send button
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ffffff', // White text for better contrast
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#7c2d12',
  },
  aiMessage: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 100, // Tab bar height (75) + bottom spacing (20) + extra padding (5)
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
    backgroundColor: '#f5f1eb',
  },
  textInput: {
    flex: 1,
    borderWidth: 2, // Thicker border for better visibility
    borderColor: '#000000', // Black border for better visibility
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#000000', // Black text
  },
  sendButton: {
    backgroundColor: '#7c2d12', // Wine red to match edit profile button
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
})
