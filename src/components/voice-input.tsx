'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Web Speech API types - using any for browser compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionType>(null)

  useEffect(() => {
    // Check for browser support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0].transcript)
        .join('')

      // Only use final results
      if (event.results[0].isFinal) {
        onTranscript(transcript)
        setIsListening(false)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access in your browser settings.'
        })
      } else if (event.error === 'no-speech') {
        toast.info('No speech detected', {
          description: 'Please speak clearly and try again.'
        })
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Failed to start recognition:', error)
        toast.error('Failed to start voice input')
      }
    }
  }, [isListening])

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  return (
    <Button
      type="button"
      variant={isListening ? 'default' : 'ghost'}
      size="icon"
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        'transition-all',
        isListening && 'bg-red-500 hover:bg-red-600 animate-pulse',
        className
      )}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}

interface VoiceOutputProps {
  text: string
  className?: string
}

export function VoiceOutput({ text, className }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false)
    }
  }, [])

  const speak = useCallback(() => {
    if (!window.speechSynthesis || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && v.name.includes('Samantha')
    ) || voices.find(
      v => v.lang.startsWith('en-US')
    ) || voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text, isSpeaking])

  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={speak}
      className={cn('h-6 w-6 p-0', className)}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? (
        <VolumeX className="h-3 w-3" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </Button>
  )
}

// Voice mode toggle for settings
interface VoiceModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function VoiceModeToggle({ enabled, onToggle }: VoiceModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={enabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle(!enabled)}
        className="gap-1.5"
      >
        {enabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        Voice {enabled ? 'On' : 'Off'}
      </Button>
    </div>
  )
}

// Listening indicator
export function ListeningIndicator() {
  return (
    <div className="flex items-center gap-2 text-red-500 text-sm">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
      </div>
      <span>Listening...</span>
    </div>
  )
}
