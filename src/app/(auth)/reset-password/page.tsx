'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PayPilotLogo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Check for error in URL params (e.g., expired token)
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const initialError = errorParam ? (errorDescription || 'The reset link is invalid or has expired.') : null
  const [error, setError] = useState<string | null>(initialError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        toast.error(updateError.message || 'Failed to reset password')
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Password reset successfully!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      console.error('Password reset error:', err)
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <PayPilotLogo className="w-10 h-10" />
              <span className="text-2xl font-bold text-foreground">
                PayPilot
              </span>
            </Link>
          </div>

          <Card className="border border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Link expired</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-accent rounded-lg p-4 text-sm text-muted-foreground">
                <p>
                  Password reset links expire after 1 hour for security reasons. Please request a new link.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Request new link
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <PayPilotLogo className="w-10 h-10" />
              <span className="text-2xl font-bold text-foreground">
                PayPilot
              </span>
            </Link>
          </div>

          <Card className="border border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Password reset!</CardTitle>
              <CardDescription>
                Your password has been successfully changed.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Redirecting to sign in...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <PayPilotLogo className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground">
              PayPilot
            </span>
          </Link>
        </div>

        <Card className="border border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="border-border focus:ring-primary"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="border-border focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset password
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
