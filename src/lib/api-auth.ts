import { createClient } from '@/lib/supabase/server'
import { DEMO_CONTEXT, DemoContext } from '@/lib/demo-context'
import { cookies } from 'next/headers'

export interface AuthContext {
  userId: string
  companyId: string
  role: string
  isDemo: boolean
}

/**
 * Get authentication context for API routes.
 * Supports both real Supabase auth and demo mode.
 *
 * Returns null if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!authError && user) {
      // Real authenticated user - look up their company membership
      const { data: membership, error: membershipError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .single()

      if (membershipError) {
        console.log('[Auth] Membership lookup failed:', {
          userId: user.id,
          error: membershipError.code,
          message: membershipError.message
        })
      }

      if (membership) {
        return {
          userId: user.id,
          companyId: membership.company_id,
          role: membership.role,
          isDemo: false,
        }
      }

      // User exists but has no company membership
      // Try to auto-create membership for demo company if using demo email
      if (user.email === 'demo@paypilot.com') {
        console.log('[Auth] Demo user detected without membership, using demo context')
        return {
          userId: user.id,
          companyId: DEMO_CONTEXT.companyId,
          role: 'owner',
          isDemo: true,
        }
      }

      console.log('[Auth] Authenticated user has no company membership:', user.id)
      return null
    }

    // No Supabase auth - check for demo mode cookie/header
    const cookieStore = await cookies()
    const demoSession = cookieStore.get('paypilot_demo_mode')

    // Also check for demo mode from request headers (for API calls from demo frontend)
    if (demoSession?.value === 'true') {
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
      }
    }

    // Default to demo mode for development if no auth is present
    // This allows the UI to work even without a real Supabase connection
    if (process.env.NODE_ENV === 'development' || process.env.PAYPILOT_DEMO_MODE === 'true') {
      console.log('[Auth] No auth detected, falling back to demo mode')
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
      }
    }

    return null
  } catch (error) {
    console.error('[Auth] Error getting auth context:', error)

    // Fallback to demo mode on error in development
    if (process.env.NODE_ENV === 'development') {
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
      }
    }

    return null
  }
}

/**
 * Require authentication - returns context or throws
 */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext()
  if (!context) {
    throw new Error('Unauthorized')
  }
  return context
}

/**
 * Check if user has required role
 */
export function hasRole(context: AuthContext, requiredRoles: string[]): boolean {
  return requiredRoles.includes(context.role)
}
