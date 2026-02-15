import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company membership
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Get the payroll run
    const { data: payrollRun, error: runError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .single()

    if (runError || !payrollRun) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 })
    }

    // Get payroll items with employee details
    const { data: payrollItems, error: itemsError } = await supabase
      .from('payroll_items')
      .select(`
        id,
        hours_worked,
        gross_pay_cents,
        federal_tax_cents,
        state_tax_cents,
        social_security_cents,
        medicare_cents,
        other_deductions_cents,
        net_pay_cents,
        status,
        company_members!payroll_items_employee_id_fkey (
          id,
          department,
          job_title,
          profiles!company_members_user_id_fkey (
            full_name
          )
        )
      `)
      .eq('payroll_run_id', id)

    if (itemsError) {
      console.error('Payroll items error:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch payroll items' }, { status: 500 })
    }

    // Format payroll items
    const formattedItems = (payrollItems || []).map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const member = item.company_members as any
      const profile = member?.profiles
      const name = profile?.full_name || 'Unknown'
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      const totalTaxes = (item.federal_tax_cents || 0) +
        (item.state_tax_cents || 0) +
        (item.social_security_cents || 0) +
        (item.medicare_cents || 0)

      return {
        id: item.id,
        name,
        avatar: initials,
        department: member?.department || 'Unknown',
        jobTitle: member?.job_title || '',
        regularHours: item.hours_worked || 80,
        overtimeHours: Math.max(0, (item.hours_worked || 80) - 80),
        grossPay: item.gross_pay_cents / 100,
        taxes: totalTaxes / 100,
        deductions: item.other_deductions_cents / 100,
        netPay: item.net_pay_cents / 100,
        status: item.status
      }
    })

    return NextResponse.json({
      payrollRun: {
        id: payrollRun.id,
        periodStart: payrollRun.period_start,
        periodEnd: payrollRun.period_end,
        payDate: payrollRun.pay_date,
        status: payrollRun.status,
        grossPay: payrollRun.total_gross_cents / 100,
        deductions: payrollRun.total_deductions_cents / 100,
        netPay: payrollRun.total_net_cents / 100
      },
      employees: formattedItems
    })
  } catch (error) {
    console.error('Payroll detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company membership with role check
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Only admins can update payroll status
    if (!['owner', 'admin', 'hr_manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update payroll status
    const updateData: Record<string, unknown> = { status }

    if (status === 'approved') {
      updateData.approved_by = user.id
      updateData.approved_at = new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    const { data: updated, error: updateError } = await supabase
      .from('payroll_runs')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .select()
      .single()

    if (updateError) {
      console.error('Payroll update error:', updateError)
      return NextResponse.json({ error: 'Failed to update payroll' }, { status: 500 })
    }

    return NextResponse.json({ payroll: updated })
  } catch (error) {
    console.error('Payroll PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
