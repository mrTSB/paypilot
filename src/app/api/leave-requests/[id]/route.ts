import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get user's company membership to verify they can approve
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    // Only owners, admins, and hr_managers can approve
    if (!['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the leave request
    const { data: leaveRequest, error: requestError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .single()

    if (requestError || !leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    if (leaveRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Update the leave request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating leave request:', updateError)
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    // If approved, update PTO balance
    if (status === 'approved') {
      const currentYear = new Date().getFullYear()

      // Get employee's PTO balance
      const { data: balance, error: balanceError } = await supabase
        .from('pto_balances')
        .select('*')
        .eq('employee_id', leaveRequest.employee_id)
        .eq('leave_type', leaveRequest.leave_type)
        .eq('year', currentYear)
        .single()

      if (balance && !balanceError) {
        // Update used days
        await supabase
          .from('pto_balances')
          .update({
            used_days: balance.used_days + leaveRequest.total_days,
            pending_days: Math.max(0, balance.pending_days - leaveRequest.total_days),
          })
          .eq('id', balance.id)
      }
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        company_id: membership.company_id,
        actor_user_id: user.id,
        actor_role: membership.role,
        action: `leave_request_${status}`,
        target_type: 'leave_request',
        target_id: id,
        before_state: { status: 'pending' },
        after_state: { status },
      })

    return NextResponse.json({
      success: true,
      leaveRequest: updatedRequest,
    })
  } catch (error) {
    console.error('Leave request API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
