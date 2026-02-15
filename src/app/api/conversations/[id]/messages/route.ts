import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { orchestrator } from '@/lib/agents'

// POST /api/conversations/[id]/messages - Send employee message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: conversationId } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify conversation exists and user has access
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Only the participant can send messages
    if (conversation.participant_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check conversation status
    if (conversation.status === 'closed') {
      return NextResponse.json({ error: 'Conversation is closed' }, { status: 400 })
    }

    if (conversation.status === 'escalated') {
      return NextResponse.json({
        error: 'This conversation has been escalated to HR. Someone will reach out to you directly.',
      }, { status: 400 })
    }

    // Parse message content
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Handle the reply through orchestrator
    const { response, escalated } = await orchestrator.handleEmployeeReply(
      conversationId,
      content.trim(),
      user.id
    )

    return NextResponse.json({
      success: true,
      escalated,
      response: response ? {
        id: response.id,
        content: response.content,
        sender_type: response.sender_type,
        created_at: response.created_at,
      } : null,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/conversations/[id]/messages - Get messages for conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: conversationId } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company and role
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    // Get conversation to verify access
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_user_id, company_id')
      .eq('id', conversationId)
      .single()

    if (!conversation || conversation.company_id !== membership.company_id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isAdmin = ['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)
    if (!isAdmin && conversation.participant_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Pagination
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const cursor = url.searchParams.get('cursor')

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (cursor) {
      query = query.gt('created_at', cursor)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      messages: messages || [],
      next_cursor: messages && messages.length === limit
        ? messages[messages.length - 1].created_at
        : null,
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
