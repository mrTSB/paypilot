'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sparkles,
  Send,
  User,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  HelpCircle,
  ArrowRight,
  ArrowDown
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const suggestedQuestions = [
  { icon: Calendar, text: "How many PTO days do I have left?", category: "Time Off" },
  { icon: DollarSign, text: "When is the next payday?", category: "Payroll" },
  { icon: Shield, text: "What's the company health insurance plan?", category: "Benefits" },
  { icon: Clock, text: "What are the core working hours?", category: "Policy" },
  { icon: HelpCircle, text: "How do I enroll in the 401(k)?", category: "Benefits" },
  { icon: Calendar, text: "Who is on leave this week?", category: "Team" },
]

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsComplete(false)

    if (!text) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, enabled])

  const complete = useCallback(() => {
    setDisplayedText(text)
    setIsComplete(true)
  }, [text])

  return { displayedText, isComplete, complete }
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <motion.span
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
}

// Message bubble component with animations
function MessageBubble({
  message,
  onStreamComplete
}: {
  message: Message
  onStreamComplete?: () => void
}) {
  const isUser = message.role === 'user'
  const { displayedText, isComplete } = useTypewriter(
    message.content,
    20, // chars per frame
    message.isStreaming === true
  )

  useEffect(() => {
    if (isComplete && message.isStreaming && onStreamComplete) {
      onStreamComplete()
    }
  }, [isComplete, message.isStreaming, onStreamComplete])

  const textToShow = message.isStreaming ? displayedText : message.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-accent text-foreground rounded-tl-none'
        }`}
      >
        <div
          className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: textToShow
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br/>')
          }}
        />
        {message.isStreaming && !isComplete && (
          <span className="inline-block w-0.5 h-4 bg-muted-foreground ml-0.5 animate-pulse" />
        )}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-accent text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}

// Call the AI API endpoint
const callAIApi = async (message: string, history: Array<{ role: string; content: string }>): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory: history.slice(-10)
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }

  const data = await response.json()
  return data.message
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI HR Assistant. I can help you with questions about PTO, payroll, benefits, company policies, and more. What would you like to know?",
      timestamp: new Date(),
      isStreaming: false
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Refs for scroll management
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user is at bottom of scroll
  const checkIfAtBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    const threshold = 120
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom < threshold
  }, [])

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  // Handle scroll events
  const handleScroll = useCallback(() => {
    setIsAtBottom(checkIfAtBottom())
  }, [checkIfAtBottom])

  // Auto-scroll when messages change (if user is at bottom)
  useEffect(() => {
    if (isAtBottom) {
      // Small delay to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom('smooth')
      })
    }
  }, [messages, isAtBottom, scrollToBottom])

  // Auto-scroll during streaming (throttled)
  useEffect(() => {
    const streamingMessage = messages.find(m => m.isStreaming)
    if (streamingMessage && isAtBottom) {
      const interval = setInterval(() => {
        if (checkIfAtBottom()) {
          scrollToBottom('smooth')
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [messages, isAtBottom, checkIfAtBottom, scrollToBottom])

  // Mark streaming message as complete
  const handleStreamComplete = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isStreaming: false } : m
    ))
  }, [])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      isStreaming: false
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    // Scroll to bottom for user message
    setTimeout(() => scrollToBottom('smooth'), 50)

    try {
      // Build conversation history for API
      const history = updatedMessages
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await callAIApi(messageText, history)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        isStreaming: true // Enable typewriter effect
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        isStreaming: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question)
  }

  const handleJumpToLatest = () => {
    scrollToBottom('smooth')
    setIsAtBottom(true)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI HR Assistant</h1>
            <p className="text-muted-foreground">Ask me anything about HR, payroll, or company policies</p>
          </div>
        </div>
      </div>

      {/* Chat Area - Flex container */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Messages container - scrollable */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 p-4"
        >
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onStreamComplete={() => handleStreamComplete(message.id)}
                />
              ))}
            </AnimatePresence>

            {/* Loading/Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary">
                      <Sparkles className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-accent rounded-2xl rounded-tl-none px-4 py-3">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-px" />
          </div>
        </div>

        {/* Jump to latest button */}
        <AnimatePresence>
          {!isAtBottom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={handleJumpToLatest}
                className="shadow-lg rounded-full px-4 gap-2"
              >
                <ArrowDown className="w-4 h-4" />
                Jump to latest
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t bg-accent/50 shrink-0">
            <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q.text)}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:bg-accent">
                    <q.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{q.text}</p>
                    <p className="text-xs text-muted-foreground">{q.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Always pinned at bottom */}
        <div className="p-4 border-t bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about PTO, payroll, benefits, policies..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI responses are for informational purposes. Always verify important details with HR.
          </p>
        </div>
      </Card>
    </div>
  )
}
