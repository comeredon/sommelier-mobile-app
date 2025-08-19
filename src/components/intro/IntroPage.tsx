import React, { useEffect, useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { useLanguage } from '../../contexts/LanguageContext'

interface IntroPageProps {
  onComplete: () => void
}

export function IntroPage({ onComplete }: IntroPageProps) {
  const { t } = useLanguage()
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  // Get sentences from translations - matching web version
  const sentences = useMemo(() => [
    t('intro.description1'),
    t('intro.description2'),
    t('intro.description3'),
    t('intro.description4')
  ], [t])

  const sentencesKey = sentences.join('')

  // Reset animation when language changes
  useEffect(() => {
    setDisplayedSentences([])
    setCurrentSentenceIndex(0)
    setShowButton(false)
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
  }, [sentencesKey, fadeAnim, slideAnim])

  // Animate sentences appearing one by one
  useEffect(() => {
    if (currentSentenceIndex >= sentences.length) {
      // Show button after all sentences are displayed
      const buttonTimer = setTimeout(() => {
        setShowButton(true)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ]).start()
      }, 600)
      return () => clearTimeout(buttonTimer)
    }

    const timer = setTimeout(() => {
      setDisplayedSentences(prev => [...prev, sentences[currentSentenceIndex]])
      setCurrentSentenceIndex(prev => prev + 1)
    }, 550) // Same timing as web version

    return () => clearTimeout(timer)
  }, [currentSentenceIndex, sentences, fadeAnim, slideAnim])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.wineIcon}>🍷</Text>
            <Text style={styles.title}>Sommelier</Text>
            <Text style={styles.tagline}>{t('intro.tagline')}</Text>
          </View>

          {/* Main Content Card */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.textContainer}>
                {displayedSentences.map((sentence, index) => (
                  <AnimatedSentence
                    key={index}
                    sentence={sentence}
                    index={index}
                  />
                ))}
              </View>

              {/* Get Started Button */}
              {showButton && (
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  <Button
                    title={t('intro.createAccount')}
                    onPress={onComplete}
                    variant="default"
                    size="lg"
                    style={styles.getStartedButton}
                    textStyle={styles.buttonText}
                  />
                </Animated.View>
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Animated sentence component
function AnimatedSentence({ sentence, index }: { sentence: string; index: number }) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(20))

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start()
    }, index * 150) // Staggered animation

    return () => clearTimeout(timer)
  }, [fadeAnim, slideAnim, index])

  if (sentence === "") {
    return <View style={styles.spacer} />
  }

  return (
    <Animated.View
      style={[
        styles.sentenceContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.sentence}>{sentence}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefbf3', // Gradient background simulation
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  wineIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  textContainer: {
    minHeight: 300,
    justifyContent: 'flex-start',
    gap: 8,
  },
  sentenceContainer: {
    marginVertical: 4,
  },
  sentence: {
    fontSize: 18,
    lineHeight: 28,
    color: '#111827',
    textAlign: 'left',
  },
  spacer: {
    height: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  getStartedButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
})
