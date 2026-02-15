// ChannelAdapter - Abstraction for message delivery channels

import { createClient } from '@/lib/supabase/server'
import { Message } from './types'

export interface ChannelAdapter {
  sendMessage(conversationId: string, content: string, metadata?: Record<string, unknown>): Promise<Message>
  markAsRead(messageIds: string[]): Promise<void>
}

/**
 * In-App messaging adapter - stores messages in database
 * Employees see messages in their Messages inbox
 */
export class InAppAdapter implements ChannelAdapter {
  async sendMessage(
    conversationId: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<Message> {
    const supabase = await createClient()

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'agent',
        content,
        content_type: 'text',
        metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }

    return message as Message
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return

    const supabase = await createClient()

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`)
    }
  }
}

/**
 * Future adapters (placeholder interfaces)
 */

export interface SMSAdapterConfig {
  twilioAccountSid: string
  twilioAuthToken: string
  fromNumber: string
}

// export class SMSAdapter implements ChannelAdapter { ... }

export interface SlackAdapterConfig {
  botToken: string
  defaultChannel?: string
}

// export class SlackAdapter implements ChannelAdapter { ... }

export interface EmailAdapterConfig {
  resendApiKey: string
  fromAddress: string
}

// export class EmailAdapter implements ChannelAdapter { ... }

/**
 * Factory to get the appropriate adapter
 */
export function getChannelAdapter(channel: 'inapp' | 'sms' | 'slack' | 'email' = 'inapp'): ChannelAdapter {
  switch (channel) {
    case 'inapp':
      return new InAppAdapter()
    // Future implementations:
    // case 'sms': return new SMSAdapter(config)
    // case 'slack': return new SlackAdapter(config)
    // case 'email': return new EmailAdapter(config)
    default:
      return new InAppAdapter()
  }
}
