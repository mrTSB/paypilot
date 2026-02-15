import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents/instances/[id] - Get single agent instance
export async function GET(
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

    // Get user's company
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    // Get instance with related data
    const { data: instance, error } = await supabase
      .from('agent_instances')
      .select(`
        *,
        agents (*),
        agent_schedules (*),
        profiles!agent_instances_created_by_fkey (full_name)
      `)
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .single()

    if (error || !instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    }

    // Get recent runs
    const { data: recentRuns } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('agent_instance_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get conversation stats
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        message_count,
        last_message_at,
        profiles!conversations_participant_user_id_fkey (full_name)
      `)
      .eq('agent_instance_id', id)
      .order('last_message_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      instance,
      recentRuns: recentRuns || [],
      conversations: conversations || [],
    })
  } catch (error) {
    console.error('Get agent instance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/agents/instances/[id] - Update agent instance
export async function PATCH(
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

    const body = await request.json()
    const { status, name, config } = body

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (name) updates.name = name
    if (config) updates.config = config

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data: instance, error } = await supabase
      .from('agent_instances')
      .update(updates)
      .eq('id', id)
      .eq('company_id', membership.company_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating instance:', error)
      return NextResponse.json({ error: 'Failed to update instance' }, { status: 500 })
    }

    return NextResponse.json({ instance })
  } catch (error) {
    console.error('Update agent instance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/agents/instances/[id] - Archive agent instance
export async function DELETE(
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

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Soft delete - archive the instance
    const { error } = await supabase
      .from('agent_instances')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('company_id', membership.company_id)

    if (error) {
      console.error('Error archiving instance:', error)
      return NextResponse.json({ error: 'Failed to archive instance' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete agent instance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
