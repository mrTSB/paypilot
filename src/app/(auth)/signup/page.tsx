'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Account info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Step 2: Company info
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            company_size: companySize,
          }
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Account created! Redirecting to dashboard...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              PayPilot
            </span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? 'Create your account' : 'Tell us about your company'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? 'Start your 14-day free trial'
                : 'This helps us personalize your experience'}
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 pt-4">
              <div className={`w-16 h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-slate-500">Must be at least 8 characters</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="companyName"
                        type="text"
                        className="pl-10"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCompanySize(size)}
                          className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                            companySize === size
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {size} employees
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${step === 1 ? 'w-full' : 'flex-1'}`}
                  disabled={loading || (step === 2 && !companySize)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : step === 1 ? (
                    'Continue'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
              <p className="text-sm text-center text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-slate-700">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
