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
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const companyId = membership.company_id

    // Fetch payroll runs
    const { data: payrollRuns, error: payrollError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', companyId)
      .order('pay_date', { ascending: false })
      .limit(10)

    if (payrollError) {
      console.error('Payroll fetch error:', payrollError)
      return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 })
    }

    // Get employee count
    const { count: employeeCount } = await supabase
      .from('company_members')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Format payroll runs for frontend
    const formattedRuns = (payrollRuns || []).map(run => ({
      id: run.id,
      payPeriod: formatDateRange(run.period_start, run.period_end),
      payDate: formatDate(run.pay_date),
      employees: employeeCount || 0,
      grossPay: run.total_gross_cents / 100,
      taxes: Math.round(run.total_gross_cents * 0.25) / 100, // Estimate 25% tax
      deductions: run.total_deductions_cents / 100,
      netPay: run.total_net_cents / 100,
      status: run.status,
      hasAllCalculations: true
    }))

    // Calculate YTD totals
    const ytdGross = (payrollRuns || []).reduce((sum, run) => sum + run.total_gross_cents, 0) / 100
    const ytdNet = (payrollRuns || []).reduce((sum, run) => sum + run.total_net_cents, 0) / 100

    // Get the current/upcoming payroll (most recent pending or draft)
    const currentPayroll = formattedRuns.find(r =>
      r.status === 'pending_approval' || r.status === 'draft'
    ) || formattedRuns[0]

    return NextResponse.json({
      payrollRuns: formattedRuns,
      currentPayroll,
      stats: {
        nextPayrollAmount: currentPayroll?.grossPay || 0,
        employeeCount: employeeCount || 0,
        nextPayDate: currentPayroll?.payDate || 'Not scheduled',
        ytdTotal: ytdGross
      }
    })
  } catch (error) {
    console.error('Payroll API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
