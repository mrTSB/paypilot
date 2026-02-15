import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { getConversationsForUser, STATIC_CONVERSATIONS } from '@/lib/agent-demo-data'

// Get demo conversations with RBAC filtering
function getDemoConversations(userId: string, isAdmin: boolean) {
  const conversations = getConversationsForUser(userId, isAdmin)

  // Map to API response format
  return {
    conversations: conversations.map(c => ({
      id: c.id,
      status: c.status,
      participant_user_id: c.participant_user_id,
      last_message_at: c.last_message_at,
      unread_count: c.unread_count,
      message_count: c.message_count,
      agent_instances: {
        id: c.agent_instance_id,
        name: c.agent_name,
        agents: {
          name: c.agent_name,
          agent_type: c.agent_instance_id === 'inst_001' ? 'pulse_check' :
                      c.agent_instance_id === 'inst_002' ? 'onboarding' : 'pulse_check',
        },
      },
      profiles: {
        id: c.participant_user_id,
        full_name: c.employee_name,
        email: `${c.employee_name.toLowerCase().replace(' ', '.')}@acme.com`,
        avatar_url: null,
      },
      latest_message: c.messages.length > 0 ? {
        id: c.messages[c.messages.length - 1].id,
        content: c.messages[c.messages.length - 1].content,
        sender_type: c.messages[c.messages.length - 1].sender_type,
        created_at: c.messages[c.messages.length - 1].created_at,
      } : null,
    })),
  }
}

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return demo data with RBAC filtering
    if (authContext.isDemo) {
      return NextResponse.json(getDemoConversations(authContext.userId, authContext.isAdmin))
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'employee' // 'employee' or 'admin'

    const supabase = await createClient()

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
      .eq('company_id', authContext.companyId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Employee view: only their conversations
    // Admin view: all conversations
    if (view === 'employee' || !authContext.isAdmin) {
      query = query.eq('participant_user_id', authContext.userId)
    }

    const { data: conversations, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // If no conversations found, return empty
    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] })
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
