import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        department,
        job_title,
        company_id,
        companies (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      // Return demo data if no membership found
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || 'User',
        },
        company: null,
        stats: {
          totalEmployees: 0,
          nextPayrollAmount: 0,
          pendingPtoRequests: 0,
          avgHoursPerWeek: 0,
        },
        recentActivity: [],
        pendingApprovals: [],
        upcomingPayroll: null,
      })
    }

    const companyId = membership.company_id

    // Fetch stats in parallel
    const [
      employeeCountResult,
      pendingPtoResult,
      recentPayrollResult,
      pendingApprovalsResult,
      recentActivityResult,
    ] = await Promise.all([
      // Total employees count
      supabase
        .from('company_members')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('status', 'active'),

      // Pending PTO requests count
      supabase
        .from('leave_requests')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('status', 'pending'),

      // Most recent payroll run
      supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', companyId)
        .order('pay_date', { ascending: false })
        .limit(1),

      // Pending approvals (PTO requests)
      supabase
        .from('leave_requests')
        .select(`
          id,
          leave_type,
          start_date,
          end_date,
          total_days,
          created_at,
          company_members!leave_requests_employee_id_fkey (
            id,
            profiles!company_members_user_id_fkey (
              full_name
            )
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent activity (combination of recent actions)
      supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Calculate next payroll (upcoming, not completed)
    const lastPayroll = recentPayrollResult.data?.[0]
    const nextPayrollDate = lastPayroll
      ? new Date(new Date(lastPayroll.pay_date).getTime() + 14 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Format pending approvals
    const pendingApprovals = (pendingApprovalsResult.data || []).map((req) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const member = req.company_members as any
      const profile = member?.profiles?.[0] || member?.profiles || null
      const name = profile?.full_name || 'Unknown'
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      return {
        id: req.id,
        name,
        type: 'PTO Request',
        details: `${req.start_date} - ${req.end_date} (${req.total_days} days)`,
        avatar: initials,
        leaveType: req.leave_type,
      }
    })

    // Format response
    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'User',
      },
      company: membership.companies,
      membership: {
        role: membership.role,
        department: membership.department,
        jobTitle: membership.job_title,
      },
      stats: {
        totalEmployees: employeeCountResult.count || 0,
        nextPayrollAmount: lastPayroll ? lastPayroll.total_net_cents / 100 : 0,
        nextPayrollDate: nextPayrollDate.toISOString(),
        pendingPtoRequests: pendingPtoResult.count || 0,
        avgHoursPerWeek: 40, // Would calculate from time_entries
      },
      pendingApprovals,
      upcomingPayroll: lastPayroll ? {
        date: nextPayrollDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        employees: employeeCountResult.count || 0,
        grossPay: lastPayroll.total_gross_cents / 100,
        taxes: Math.round(lastPayroll.total_gross_cents * 0.25) / 100, // Estimate
        deductions: lastPayroll.total_deductions_cents / 100,
        netPay: lastPayroll.total_net_cents / 100,
      } : null,
      recentActivity: (recentActivityResult.data || []).map(log => ({
        id: log.id,
        type: log.target_type,
        action: log.action,
        time: new Date(log.created_at).toLocaleString(),
        status: 'completed',
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
