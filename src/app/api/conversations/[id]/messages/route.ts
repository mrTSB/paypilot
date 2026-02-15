import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { orchestrator } from '@/lib/agents'
import { getConversationById } from '@/lib/agent-demo-data'
import { addDemoMessage } from '@/lib/demo-context'

// Demo AI responses based on message content
function generateDemoAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()

  // Detect sentiment and respond accordingly
  if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('anxious') || msg.includes('tired')) {
    return "I hear that you're going through a challenging time. Your wellbeing matters to us. Would you like me to share some resources that might help, or would you prefer to talk more about what's going on?"
  }

  if (msg.includes('great') || msg.includes('good') || msg.includes('happy') || msg.includes('excited')) {
    return "That's wonderful to hear! 🎉 What's been the highlight for you? I'd love to know more about what's going well."
  }

  if (msg.includes('deadline') || msg.includes('workload') || msg.includes('busy')) {
    return "Thanks for sharing that. Balancing priorities can be tough. Is there anything specific that's taking up most of your bandwidth right now?"
  }

  if (msg.includes('team') || msg.includes('manager') || msg.includes('colleague')) {
    return "Team dynamics are so important. How would you describe your working relationship with your team right now?"
  }

  // Default encouraging responses
  const responses = [
    "Thanks for sharing! That's really helpful to hear. Is there anything else on your mind?",
    "I appreciate you opening up. How are you feeling about the week ahead?",
    "Got it! Your feedback is valuable. Anything else you'd like to add?",
    "Thanks for the update! It sounds like you've been thoughtful about this. What's your priority for next week?",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// POST /api/conversations/[id]/messages - Send employee message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext()
    const { id: conversationId } = await params

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Handle demo mode
    if (authContext.isDemo) {
      const conv = getConversationById(conversationId, authContext.userId, authContext.isAdmin)

      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      // Only participant can send messages
      if (conv.participant_user_id !== authContext.userId && !authContext.isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Add the employee's message
      addDemoMessage(conversationId, content.trim(), 'employee')

      // Generate and add AI response
      const aiResponseContent = generateDemoAIResponse(content.trim())
      const aiResponse = addDemoMessage(conversationId, aiResponseContent, 'agent')

      return NextResponse.json({
        success: true,
        escalated: false,
        response: {
          id: aiResponse.id,
          content: aiResponse.content,
          sender_type: aiResponse.sender_type,
          created_at: aiResponse.created_at,
        },
      })
    }

    const supabase = await createClient()

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
    if (conversation.participant_user_id !== authContext.userId) {
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

    // Handle the reply through orchestrator
    const { response, escalated } = await orchestrator.handleEmployeeReply(
      conversationId,
      content.trim(),
      authContext.userId
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
    const authContext = await getAuthContext()
    const { id: conversationId } = await params

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle demo mode
    if (authContext.isDemo) {
      const conv = getConversationById(conversationId, authContext.userId, authContext.isAdmin)

      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      // Return messages from static data
      return NextResponse.json({
        messages: conv.messages.map(m => ({
          id: m.id,
          content: m.content,
          sender_type: m.sender_type,
          content_type: 'text',
          created_at: m.created_at,
          is_read: true,
        })),
        next_cursor: null,
      })
    }

    const supabase = await createClient()

    // Get conversation to verify access
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_user_id, company_id')
      .eq('id', conversationId)
      .single()

    if (!conversation || conversation.company_id !== authContext.companyId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isAdmin = ['owner', 'admin', 'hr_manager', 'manager'].includes(authContext.role)
    if (!isAdmin && conversation.participant_user_id !== authContext.userId) {
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
