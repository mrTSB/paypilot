import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth Callback Handler
 *
 * This route handles the callback from OAuth providers (e.g., Google).
 * Supabase redirects here after successful OAuth authentication.
 *
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. User is redirected to Google's OAuth consent screen
 * 3. After approval, Google redirects to Supabase callback URL
 * 4. Supabase processes the OAuth response and redirects here with a code
 * 5. We exchange the code for a session and redirect to dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors (e.g., user denied consent)
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
  }

  // Exchange the code for a session
  if (code) {
    const supabase = await createClient()

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
    }

    if (data.session) {
      // Successfully authenticated
      // Check if user needs to complete onboarding (new user via OAuth)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single()

      if (!profile) {
        // New user - create profile from OAuth data
        const user = data.session.user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            status: 'active',
            role: 'employee',
          }, { onConflict: 'id' })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway - profile will be created on next request
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code provided - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
