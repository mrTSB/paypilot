import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { orchestrator } from '@/lib/agents'

// POST /api/agents/instances/[id]/trigger - Manually trigger agent
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify permissions
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin', 'hr_manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify instance exists and belongs to company
    const { data: instance } = await supabase
      .from('agent_instances')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .single()

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    }

    if (instance.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not active' }, { status: 400 })
    }

    // Parse optional target employees
    const body = await request.json().catch(() => ({}))
    const targetEmployees = body.target_employees as string[] | undefined

    // Trigger the agent
    const result = await orchestrator.triggerAgentRun(id, 'manual', targetEmployees)

    // Log action
    await supabase
      .from('audit_logs')
      .insert({
        company_id: membership.company_id,
        actor_user_id: user.id,
        actor_role: membership.role,
        action: 'agent_triggered',
        target_type: 'agent_instance',
        target_id: id,
        after_state: result,
      })

    return NextResponse.json({
      success: true,
      run_id: result.runId,
      messages_sent: result.messagesSent,
      conversations_touched: result.conversationsTouched,
    })
  } catch (error) {
    console.error('Trigger agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
