import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateAgentInstanceRequest } from '@/lib/agents/types'

// GET /api/agents/instances - List agent instances for company
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ instances: [] })
    }

    // Get agent instances with related data
    const { data: instances, error } = await supabase
      .from('agent_instances')
      .select(`
        *,
        agents (*),
        agent_schedules (*),
        profiles!agent_instances_created_by_fkey (full_name)
      `)
      .eq('company_id', membership.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching instances:', error)
      return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 })
    }

    // Get stats for each instance
    const instancesWithStats = await Promise.all(
      (instances || []).map(async (instance) => {
        const { count: conversationCount } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('agent_instance_id', instance.id)

        const { count: messageCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', instance.id)

        return {
          ...instance,
          stats: {
            conversations: conversationCount || 0,
            messages: messageCount || 0,
          },
        }
      })
    )

    return NextResponse.json({ instances: instancesWithStats })
  } catch (error) {
    console.error('Agent instances API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agents/instances - Create new agent instance
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company and verify admin/hr role
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    if (!['owner', 'admin', 'hr_manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: CreateAgentInstanceRequest = await request.json()

    // Validate required fields
    if (!body.agent_id || !body.name || !body.config || !body.schedule) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create agent instance
    const { data: instance, error: instanceError } = await supabase
      .from('agent_instances')
      .insert({
        company_id: membership.company_id,
        agent_id: body.agent_id,
        created_by: user.id,
        name: body.name,
        config: body.config,
        status: 'active',
      })
      .select()
      .single()

    if (instanceError) {
      console.error('Error creating instance:', instanceError)
      return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 })
    }

    // Create schedule
    const nextRunAt = calculateNextRun(body.schedule.cadence)

    const { error: scheduleError } = await supabase
      .from('agent_schedules')
      .insert({
        agent_instance_id: instance.id,
        cadence: body.schedule.cadence,
        cron_expression: body.schedule.cron_expression || null,
        timezone: body.schedule.timezone || 'America/New_York',
        next_run_at: nextRunAt,
        is_active: true,
      })

    if (scheduleError) {
      console.error('Error creating schedule:', scheduleError)
      // Don't fail the whole request, schedule can be created later
    }

    // Log action
    await supabase
      .from('audit_logs')
      .insert({
        company_id: membership.company_id,
        actor_user_id: user.id,
        actor_role: membership.role,
        action: 'agent_instance_created',
        target_type: 'agent_instance',
        target_id: instance.id,
        after_state: { name: body.name, agent_id: body.agent_id },
      })

    return NextResponse.json({ instance })
  } catch (error) {
    console.error('Create agent instance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateNextRun(cadence: string): string | null {
  const now = new Date()
  let next: Date

  switch (cadence) {
    case 'once':
      // Schedule for next hour
      next = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case 'daily':
      // Tomorrow at 9am
      next = new Date(now)
      next.setDate(next.getDate() + 1)
      next.setHours(9, 0, 0, 0)
      break
    case 'weekly':
      // Next Monday at 9am
      next = new Date(now)
      next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7))
      next.setHours(9, 0, 0, 0)
      break
    case 'biweekly':
      // Two weeks from now
      next = new Date(now)
      next.setDate(next.getDate() + 14)
      next.setHours(9, 0, 0, 0)
      break
    case 'monthly':
      // First of next month at 9am
      next = new Date(now)
      next.setMonth(next.getMonth() + 1, 1)
      next.setHours(9, 0, 0, 0)
      break
    default:
      next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return next.toISOString()
}
