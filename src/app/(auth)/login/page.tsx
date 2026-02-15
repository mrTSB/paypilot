'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Info, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { PayPilotLogo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

// Real demo credentials (must be seeded in Supabase)
const DEMO_USERS = {
  admin: {
    email: 'demo@acme.com',
    password: 'demo123',
    name: 'Demo Admin',
    role: 'owner',
    description: 'Full access: create & run agents',
  },
  employee: {
    email: 'sarah.chen@acme.com',
    password: 'demo123',
    name: 'Sarah Chen',
    role: 'member',
    description: 'Employee view: messages only',
  },
}

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check for demo mode login first
      const isDemoUser = Object.values(DEMO_USERS).some(u => u.email === email)

      if (isDemoUser) {
        // Set demo mode cookies
        document.cookie = `paypilot_demo_mode=true; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `paypilot_demo_email=${encodeURIComponent(email)}; path=/; max-age=${7 * 24 * 60 * 60}`

        // Store demo session in localStorage for persistence
        const demoUser = Object.values(DEMO_USERS).find(u => u.email === email)
        localStorage.setItem('paypilot_demo_session', JSON.stringify({
          user: { email, name: demoUser?.name, role: demoUser?.role },
          timestamp: Date.now(),
        }))

        toast.success(`Welcome, ${demoUser?.name || 'Demo User'}!`)

        // Redirect based on user - employees go to messages, admins go to overview
        if (email === DEMO_USERS.employee.email) {
          router.push('/messages')
        } else {
          router.push('/overview')
        }
        return
      }

      // Try real Supabase auth for non-demo users
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        toast.error(error.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (data.user) {
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google login error:', error)
        toast.error(error.message || 'Failed to sign in with Google')
        setGoogleLoading(false)
      }
      // If successful, user will be redirected to Google
    } catch (err) {
      console.error('Google login error:', err)
      toast.error('An error occurred. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleDemoLogin = (type: 'admin' | 'employee') => {
    const creds = DEMO_USERS[type]
    setEmail(creds.email)
    setPassword(creds.password)
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

        {/* Demo notice */}
        <div className="bg-accent border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Try Demo Mode</p>
              <p className="text-sm text-muted-foreground">
                Click a role to fill credentials, then sign in
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors text-sm"
            >
              <Shield className="w-4 h-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">{DEMO_USERS.admin.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.admin.description}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors text-sm"
            >
              <User className="w-4 h-4 text-green-500" />
              <div className="text-left">
                <div className="font-medium">{DEMO_USERS.employee.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.employee.description}</div>
              </div>
            </button>
          </div>
        </div>

        <Card className="border border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-border hover:bg-secondary"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 mr-3" />
                    Continue with Google
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in with Email'
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
