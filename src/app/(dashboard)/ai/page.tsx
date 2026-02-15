'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  HelpCircle,
  ArrowRight
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  { icon: Calendar, text: "How many PTO days do I have left?", category: "Time Off" },
  { icon: DollarSign, text: "When is the next payday?", category: "Payroll" },
  { icon: Shield, text: "What's the company health insurance plan?", category: "Benefits" },
  { icon: Clock, text: "What are the core working hours?", category: "Policy" },
  { icon: HelpCircle, text: "How do I enroll in the 401(k)?", category: "Benefits" },
  { icon: Calendar, text: "Who is on leave this week?", category: "Team" },
]

// Simulated AI responses based on question keywords
const getAIResponse = (question: string): string => {
  const q = question.toLowerCase()

  if (q.includes('pto') || q.includes('vacation') || q.includes('time off') || q.includes('days off')) {
    return `Based on your records, you have **96 hours (12 days)** of PTO remaining for 2026.\n\nHere's your breakdown:\n- Annual PTO allowance: 120 hours (15 days)\n- Used this year: 24 hours (3 days)\n- Remaining: 96 hours (12 days)\n\nYou also have **32 hours (4 days)** of sick leave available.\n\nWould you like to submit a time off request?`
  }

  if (q.includes('payday') || q.includes('pay date') || q.includes('next payroll') || q.includes('when do i get paid')) {
    return `The next payday is **February 20, 2026**.\n\nAcme Technologies runs payroll on a biweekly schedule. Here are the upcoming pay dates:\n- Feb 20, 2026 (for Feb 2-15 pay period)\n- Mar 6, 2026 (for Feb 16 - Mar 1 pay period)\n- Mar 20, 2026 (for Mar 2-15 pay period)\n\nPayments are typically deposited by 9 AM on pay day.`
  }

  if (q.includes('health insurance') || q.includes('medical') || q.includes('health plan')) {
    return `Acme Technologies offers the **Blue Cross Premium Health Plan**.\n\n**Key Details:**\n- Company pays 75% of the premium\n- Your monthly cost: $150.00\n- Deductible: $500 individual / $1,000 family\n- Copay: $20 primary care / $40 specialist\n\n**Coverage includes:**\n- Preventive care (100% covered)\n- Hospital stays\n- Prescription drugs\n- Mental health services\n\nWould you like me to help you find in-network providers or explain any specific coverage?`
  }

  if (q.includes('401k') || q.includes('retirement') || q.includes('401(k)')) {
    return `Acme Technologies offers a **401(k) retirement plan** through Fidelity.\n\n**Key Details:**\n- Company match: 4% of your salary\n- Immediate vesting (you own 100% from day 1)\n- Contribution limit (2026): $23,000\n\n**To Enroll:**\n1. Log into Fidelity NetBenefits\n2. Select "Enroll in 401(k)"\n3. Choose your contribution percentage\n4. Select your investment funds\n\nI recommend contributing at least 4% to maximize the company match. Would you like me to help you get started?`
  }

  if (q.includes('core hours') || q.includes('working hours') || q.includes('work hours') || q.includes('schedule')) {
    return `Acme Technologies follows a **hybrid work model**.\n\n**Schedule:**\n- Office days: Tuesday, Wednesday, Thursday\n- Remote days: Monday, Friday\n- Core hours: 10 AM - 4 PM PT\n\nYou're expected to be available during core hours for meetings and collaboration. Outside of core hours, you have flexibility to manage your own schedule.\n\nNeed to request a schedule accommodation? I can help with that.`
  }

  if (q.includes('who is on leave') || q.includes("who's out") || q.includes('who is out')) {
    return `Here's who's on leave this week (Feb 10-14, 2026):\n\n**Currently Out:**\n- Rachel Kim (HR) - On leave until Feb 21\n\n**Upcoming Time Off:**\n- Sarah Chen - Feb 24-26 (pending approval)\n- Tom Wilson - Mar 3-7 (pending approval)\n\nWould you like to see the full team calendar?`
  }

  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) {
    return `**Acme Technologies Remote Work Policy:**\n\nWe follow a hybrid model:\n- **In-office days:** Tuesday, Wednesday, Thursday\n- **Remote days:** Monday, Friday\n- **Core hours:** 10 AM - 4 PM PT\n\n**Home Office Benefits:**\n- $500 one-time setup stipend\n- $50/month ongoing stipend\n- VPN access required\n\nNeed equipment or have questions about remote work setup?`
  }

  // Default response
  return `I understand you're asking about "${question}". Let me help you with that.\n\nI can assist with:\n- **Time Off:** PTO balance, requesting time off, leave policies\n- **Payroll:** Pay dates, pay stubs, direct deposit\n- **Benefits:** Health insurance, dental, vision, 401(k)\n- **Policies:** Remote work, dress code, expense reports\n\nCould you provide more details about what you'd like to know?`
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI HR Assistant. I can help you with questions about PTO, payroll, benefits, company policies, and more. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = getAIResponse(messageText)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI HR Assistant</h1>
            <p className="text-slate-600">Ask me anything about HR, payroll, or company policies</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600">
                      <Sparkles className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-900 rounded-tl-none'
                  }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600">
                    <Sparkles className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t bg-slate-50">
            <p className="text-sm text-slate-500 mb-3">Suggested questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q.text)}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                    <q.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{q.text}</p>
                    <p className="text-xs text-slate-500">{q.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about PTO, payroll, benefits, policies..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-2">
            AI responses are for informational purposes. Always verify important details with HR.
          </p>
        </div>
      </Card>
    </div>
  )
}
