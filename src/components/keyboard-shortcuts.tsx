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

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', 'E'], description: 'Go to Employees' },
  { keys: ['⌘', 'P'], description: 'Go to Payroll' },
  { keys: ['⌘', 'T'], description: 'Go to Time & PTO' },
  { keys: ['⌘', 'B'], description: 'Go to Benefits' },
  { keys: ['⌘', 'R'], description: 'Go to Reports' },
  { keys: ['⌘', 'A'], description: 'Go to AI Assistant' },
  { keys: ['⌘', '/'], description: 'Go to Settings' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close dialogs' },
]

const navigationShortcuts = [
  { keys: ['G', 'H'], description: 'Go to Overview (home)' },
  { keys: ['G', 'E'], description: 'Go to Employees' },
  { keys: ['G', 'P'], description: 'Go to Payroll' },
  { keys: ['G', 'A'], description: 'Go to AI Agents' },
  { keys: ['G', 'I'], description: 'Go to Insights' },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts on "?" key (Shift + /)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Keyboard Shortcuts
            <Badge variant="secondary" className="text-xs">Pro tip</Badge>
          </DialogTitle>
          <DialogDescription>
            Navigate PayPilot faster with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">General</h4>
            <div className="space-y-2">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="px-2 py-1 text-xs font-mono bg-accent border border-border rounded text-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Quick Navigation</h4>
            <p className="text-xs text-muted-foreground mb-3">Press keys in sequence (e.g., G then H)</p>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="px-2 py-1 text-xs font-mono bg-accent border border-border rounded text-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-accent border rounded">Esc</kbd> to close
        </p>
      </DialogContent>
    </Dialog>
  )
}
