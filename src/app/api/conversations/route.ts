import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'employee' // 'employee' or 'admin'

    // Get user's company and role
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ conversations: [] })
    }

    let query = supabase
      .from('conversations')
      .select(`
        *,
        agent_instances (
          id,
          name,
          agents (
            name,
            agent_type
          )
        ),
        profiles!conversations_participant_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('company_id', membership.company_id)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Employee view: only their conversations
    // Admin view: all conversations
    if (view === 'employee' || !['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)) {
      query = query.eq('participant_user_id', user.id)
    }

    const { data: conversations, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Get latest message for each conversation
    const conversationsWithPreview = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          latest_message: latestMessage || null,
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithPreview })
  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
