'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  PartyPopper,
  Zap,
  LayoutGrid,
  Keyboard,
  Search,
  Bot,
  TrendingUp,
} from 'lucide-react'

const CURRENT_VERSION = 'v1.2.0'
const STORAGE_KEY = 'paypilot_whats_new_seen'

const updates = [
  {
    icon: LayoutGrid,
    title: 'New Overview Dashboard',
    description: 'Comprehensive stats, quick actions, and organization insights all in one place.',
    isNew: true,
  },
  {
    icon: PartyPopper,
    title: 'Celebrations Section',
    description: 'See birthdays, work anniversaries, and new hires at a glance.',
    isNew: true,
  },
  {
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    description: 'Press ? anytime to see all keyboard shortcuts. Use Cmd+K for quick navigation.',
    isNew: true,
  },
  {
    icon: Search,
    title: 'Enhanced Search',
    description: 'Command palette now includes employee search with photos and roles.',
    isNew: true,
  },
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'Launch automated pulse checks, onboarding flows, and feedback campaigns.',
    isNew: false,
  },
  {
    icon: TrendingUp,
    title: 'Company Pulse',
    description: 'Real-time sentiment analysis and employee feedback insights.',
    isNew: false,
  },
]

export function WhatsNewDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen this version
    const seenVersion = localStorage.getItem(STORAGE_KEY)
    if (seenVersion !== CURRENT_VERSION) {
      // Delay showing to not interrupt initial load
      const timer = setTimeout(() => {
        setOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
      else setOpen(isOpen)
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What&apos;s New in PayPilot
            <Badge variant="secondary" className="text-xs">{CURRENT_VERSION}</Badge>
          </DialogTitle>
          <DialogDescription>
            Recent updates and improvements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
          {updates.map((update, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                update.isNew ? 'bg-primary/10' : 'bg-accent'
              }`}>
                <update.icon className={`w-5 h-5 ${update.isNew ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground text-sm">{update.title}</h4>
                  {update.isNew && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                      NEW
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{update.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>
            <Zap className="w-4 h-4 mr-2" />
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
