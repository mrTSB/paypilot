'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PayPilotLogoFull } from '@/components/logo'
import { Home, ArrowLeft, HelpCircle, Search } from 'lucide-react'

export default function NotFound() {
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

      {/* 404 Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="text-[180px] md:text-[240px] font-bold text-primary/10 leading-none select-none">
          404
        </div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
            <Search className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
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
          Page not found
        </h1>
        <p className="text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button asChild size="lg" className="gap-2">
          <Link href="/overview">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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
          Need help?{' '}
          <Link href="/ai" className="text-primary hover:underline inline-flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Ask our AI Assistant
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
