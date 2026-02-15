'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PayPilotLogoFull } from '@/components/logo'
import { Home, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link href="/">
          <PayPilotLogoFull className="h-8" />
        </Link>
      </motion.div>

      {/* Error Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <motion.div
          className="w-24 h-24 md:w-32 md:h-32 bg-destructive/10 rounded-2xl flex items-center justify-center"
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-destructive" />
        </motion.div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8 max-w-md"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
          Try refreshing the page or going back to the dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button onClick={reset} size="lg" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/overview">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </Button>
      </motion.div>

      {/* Help Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Still having issues?{' '}
          <Link href="/ai" className="text-primary hover:underline inline-flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
