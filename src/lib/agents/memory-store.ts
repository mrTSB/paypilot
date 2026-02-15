// MemoryStore - Conversation context and history management

import { createClient } from '@/lib/supabase/server'
import { Message, Conversation, FeedbackSummary } from './types'

export interface ConversationContext {
  conversation: Conversation
  messages: Message[]
  latestSummary: FeedbackSummary | null
  participantName: string
  participantEmail: string
}

export class MemoryStore {
  /**
   * Get conversation context with last N messages
   */
  static async getConversationContext(
    conversationId: string,
    messageLimit: number = 20
  ): Promise<ConversationContext | null> {
    const supabase = await createClient()

    // Get conversation with participant info
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      console.error('Failed to get conversation:', convError)
      return null
    }

    // Get recent messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(messageLimit)

    if (msgError) {
      console.error('Failed to get messages:', msgError)
      return null
    }

    // Get latest summary
    const { data: summaries } = await supabase
      .from('feedback_summaries')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('computed_at', { ascending: false })
      .limit(1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = conversation.profiles as any

    return {
      conversation: conversation as Conversation,
      messages: (messages || []) as Message[],
      latestSummary: summaries?.[0] as FeedbackSummary || null,
      participantName: profile?.full_name || 'Employee',
      participantEmail: profile?.email || '',
    }
  }

  /**
   * Get or create conversation for an employee and agent instance
   */
  static async getOrCreateConversation(
    companyId: string,
    agentInstanceId: string,
    participantUserId: string
  ): Promise<Conversation> {
    const supabase = await createClient()

    // Try to find existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_instance_id', agentInstanceId)
      .eq('participant_user_id', participantUserId)
      .single()

    if (existing) {
      return existing as Conversation
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        company_id: companyId,
        agent_instance_id: agentInstanceId,
        participant_user_id: participantUserId,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    return newConv as Conversation
  }

  /**
   * Get all active conversations for an agent instance
   */
  static async getActiveConversations(agentInstanceId: string): Promise<Conversation[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_instance_id', agentInstanceId)
      .eq('status', 'active')

    if (error) {
      console.error('Failed to get conversations:', error)
      return []
    }

    return (data || []) as Conversation[]
  }

  /**
   * Get employees who should receive pings (based on audience config)
   */
  static async getTargetEmployees(
    companyId: string,
    audienceConfig: {
      audience_type: string
      audience_filter?: {
        department?: string
        role_ids?: string[]
        employee_ids?: string[]
      }
    }
  ): Promise<{ user_id: string; full_name: string }[]> {
    const supabase = await createClient()

    let query = supabase
      .from('company_members')
      .select(`
        user_id,
        profiles!company_members_user_id_fkey (
          full_name
        )
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Apply audience filters
    if (audienceConfig.audience_type === 'department' && audienceConfig.audience_filter?.department) {
      query = query.eq('department', audienceConfig.audience_filter.department)
    }

    if (audienceConfig.audience_type === 'individual' && audienceConfig.audience_filter?.employee_ids) {
      query = query.in('user_id', audienceConfig.audience_filter.employee_ids)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to get target employees:', error)
      return []
    }

    return (data || []).map(row => ({
      user_id: row.user_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      full_name: (row.profiles as any)?.full_name || 'Employee',
    }))
  }

  /**
   * Format conversation history for AI context
   */
  static formatForPrompt(
    messages: Message[],
    latestSummary: FeedbackSummary | null,
    participantName: string
  ): string {
    let context = ''

    // Include summary if available
    if (latestSummary) {
      context += `[Previous conversation summary: ${latestSummary.summary}]\n`
      if (latestSummary.tags && latestSummary.tags.length > 0) {
        context += `[Topics discussed: ${latestSummary.tags.join(', ')}]\n`
      }
      context += '\n'
    }

    // Include recent messages
    if (messages.length > 0) {
      context += 'Recent conversation:\n'
      for (const msg of messages.slice(-10)) {
        const sender = msg.sender_type === 'employee' ? participantName : 'Assistant'
        context += `${sender}: ${msg.content}\n`
      }
    }

    return context
  }

  /**
   * Check if conversation is stale (no activity in X days)
   */
  static async checkStaleness(conversationId: string, staleDays: number = 7): Promise<{
    isStale: boolean
    daysSinceLastMessage: number
    nudgeCount: number
  }> {
    const supabase = await createClient()

    const { data: conversation } = await supabase
      .from('conversations')
      .select('last_message_at, metadata')
      .eq('id', conversationId)
      .single()

    if (!conversation || !conversation.last_message_at) {
      return { isStale: false, daysSinceLastMessage: 0, nudgeCount: 0 }
    }

    const lastMessageDate = new Date(conversation.last_message_at)
    const now = new Date()
    const daysSince = Math.floor((now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = conversation.metadata as any
    const nudgeCount = metadata?.nudge_count || 0

    return {
      isStale: daysSince >= staleDays,
      daysSinceLastMessage: daysSince,
      nudgeCount,
    }
  }

  /**
   * Update nudge count for a conversation
   */
  static async incrementNudgeCount(conversationId: string): Promise<void> {
    const supabase = await createClient()

    const { data: conversation } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('id', conversationId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMetadata = (conversation?.metadata as any) || {}
    const newNudgeCount = (currentMetadata.nudge_count || 0) + 1

    await supabase
      .from('conversations')
      .update({
        metadata: { ...currentMetadata, nudge_count: newNudgeCount },
      })
      .eq('id', conversationId)
  }
}
