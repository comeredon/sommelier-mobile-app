import AsyncStorage from '@react-native-async-storage/async-storage'

// Always use Azure backend for both development and production
// This ensures consistent access to the database and AI services
const API_URL = 'https://sommelier-backend-app.azurewebsites.net'

// Optional: Keep local backend URL as fallback (uncomment to use local backend)
// const API_URL = __DEV__ 
//   ? 'https://192.168.0.206:3001'  // Local development backend
//   : 'https://sommelier-backend-app.azurewebsites.net'

// Simple request queue to prevent overwhelming the backend
const requestQueue: Array<() => Promise<any>> = []
let isProcessingQueue = false

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return
  
  isProcessingQueue = true
  while (requestQueue.length > 0) {
    const request = requestQueue.shift()
    if (request) {
      try {
        await request()
      } catch (error) {
        // Handle individual request failures
      }
    }
    // Small delay between requests to prevent overload
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  isProcessingQueue = false
}

interface ApiOptions extends RequestInit {
  queued?: boolean
}

export async function apiRequest(path: string, options: ApiOptions = {}) {
  const token = await AsyncStorage.getItem('auth-token')
  // Get current language from AsyncStorage
  const language = await AsyncStorage.getItem('language') || 'en'
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': language, // Include language in headers for AI services
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const request = async () => {
    try {
      const res = await fetch(`${API_URL}${path}`, { 
        ...options, 
        headers 
      })
      
      if (!res.ok) {
        let errorData: any
        try {
          errorData = await res.json()
        } catch (e) {
          // If response is not JSON, create a generic error
          errorData = { error: `HTTP ${res.status}: ${res.statusText}` }
        }
        throw errorData
      }
      return res.json()
    } catch (err) {
      throw err
    }
  }

  // For non-critical requests, use the queue
  if (options.queued) {
    return new Promise((resolve, reject) => {
      requestQueue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      processQueue()
    })
  }

  // For critical requests, execute immediately
  return request()
}

export async function registerUser(data: {
  email: string
  password: string
  birthMonth: number
  birthYear: number
}) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginUser(data: {
  email: string
  password: string
}) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProfile(data: any) {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getWines() {
  return apiRequest('/wines')
}

export async function addWine(data: {
  name: string
  producer: string
  year: number
  type?: string
  region?: string
  notes?: string
}) {
  return apiRequest('/wines', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateWine(id: string, data: any) {
  return apiRequest(`/wines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteWine(id: string) {
  return apiRequest(`/wines/${id}`, {
    method: 'DELETE',
  })
}

// AI-powered wine pairing recommendations
export async function getWinePairing(dish: string, userPreferences?: any, conversationHistory?: any[]) {
  const language = await AsyncStorage.getItem('language') || 'en'
  return apiRequest('/ai/pairing', {
    method: 'POST',
    body: JSON.stringify({ dish, userPreferences, language, conversationHistory }),
  })
}

// General wine advice
export async function getWineAdvice(question: string, conversationHistory?: any[]) {
  const language = await AsyncStorage.getItem('language') || 'en'
  return apiRequest('/ai/advice', {
    method: 'POST',
    body: JSON.stringify({ question, language, conversationHistory }),
  })
}

// Conversational AI chat
export async function chatWithAI(message: string, conversationHistory?: any[]) {
  const language = await AsyncStorage.getItem('language') || 'en'
  return apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language, conversationHistory }),
  })
}

// Wine recognition from image
export async function recognizeWineFromImage(imageBase64: string) {
  return apiRequest('/ai/recognize-wine', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 }),
  })
}

// Generate wine description using AI
export async function generateWineDescription(wineData: {
  name: string
  producer?: string
  region?: string
  year?: number
}, detectedLanguage?: string) {
  // Use detected language from frontend if provided, otherwise fallback to AsyncStorage
  const language = detectedLanguage || await AsyncStorage.getItem('language') || 'en'
  
  // Create language-specific instruction
  const languageInstruction = language === 'fr' 
    ? 'Répondez en français. ' 
    : ''
  
  const message = `${languageInstruction}Write a concise wine description (about 100 words) for ${wineData.name}${wineData.producer ? ' by ' + wineData.producer : ''}${wineData.year ? ' (' + wineData.year + ')' : ''}${wineData.region ? ' from ' + wineData.region : ''}. Include tasting notes, characteristics, and food pairing suggestions.`
  
  return apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  })
}
