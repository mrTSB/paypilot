// AgentOrchestrator - Central coordinator for AI agent operations

import { createClient } from '@/lib/supabase/server'
import { Agent, AgentInstance, Conversation, Message, AgentInstanceConfig } from './types'
import { PolicyGuard } from './policy-guard'
import { InsightExtractor } from './insight-extractor'
import { MemoryStore } from './memory-store'
import { InAppAdapter } from './channel-adapter'
import { generateAgentResponse, generateInitialMessage, isAnthropicConfigured, AgentContext } from '@/lib/anthropic'

// System prompts for different tones
const TONE_PROMPTS: Record<string, string> = {
  friendly_peer: 'Communicate like a friendly coworker. Use casual language, contractions, and occasional emoji. Be warm but not overly familiar.',
  professional_hr: 'Communicate professionally as an HR representative. Use proper grammar, be supportive and empathetic, but maintain appropriate boundaries.',
  witty_safe: 'Use light humor and wit to keep conversations engaging, but never at anyone\'s expense. Stay positive and inclusive.',
  poke_lite: 'Be brief, friendly, and slightly playful. Ask ONE question at a time, max 240 characters. Never guilt-trip or manipulate. Reference previous conversations when relevant.',
}

// Opening messages by agent type
const OPENING_MESSAGES: Record<string, string[]> = {
  pulse_check: [
    "Hey! Quick check-in - how's your week going so far?",
    "Hi there! Just wanted to touch base. How are things going?",
    "Hey! Time for our weekly pulse. How's everything feeling?",
  ],
  onboarding: [
    "Welcome! I'm here to help you get settled. How's your first week going?",
    "Hi! I'm your onboarding buddy. Quick question - do you have everything you need to get started?",
  ],
  exit_interview: [
    "Thank you for taking a moment to share your experience with us. First, how would you describe your overall time here?",
  ],
  manager_coaching: [
    "Hey! Quick reflection check-in. How did your 1:1s go this week?",
    "Hi there! Let's do a quick leadership pulse. How's the team feeling?",
  ],
}

export class AgentOrchestrator {
  private adapter: InAppAdapter

  constructor() {
    this.adapter = new InAppAdapter()
  }

  /**
   * Trigger a scheduled or manual run for an agent instance
   */
  async triggerAgentRun(
    agentInstanceId: string,
    runType: 'scheduled' | 'manual' = 'manual',
    targetEmployeeIds?: string[]
  ): Promise<{ runId: string; messagesSent: number; conversationsTouched: number }> {
    const supabase = await createClient()

    // Get agent instance with agent template
    const { data: instance, error: instanceError } = await supabase
      .from('agent_instances')
      .select(`
        *,
        agents (*)
      `)
      .eq('id', agentInstanceId)
      .single()

    if (instanceError || !instance) {
      throw new Error(`Agent instance not found: ${instanceError?.message}`)
    }

    const agent = instance.agents as Agent
    const config = instance.config as AgentInstanceConfig

    // Create run record
    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_instance_id: agentInstanceId,
        run_type: runType,
        status: 'running',
      })
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`)
    }

    let messagesSent = 0
    let conversationsTouched = 0

    try {
      // Get target employees
      let employees: { user_id: string; full_name: string }[]

      if (targetEmployeeIds && targetEmployeeIds.length > 0) {
        // Manual trigger with specific employees
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', targetEmployeeIds)

        employees = (profiles || []).map(p => ({ user_id: p.id, full_name: p.full_name }))
      } else {
        // Get all target employees based on config
        employees = await MemoryStore.getTargetEmployees(instance.company_id, config)
      }

      // Process each employee
      for (const employee of employees) {
        try {
          const conversation = await MemoryStore.getOrCreateConversation(
            instance.company_id,
            agentInstanceId,
            employee.user_id
          )

          // Check staleness
          const { isStale, nudgeCount } = await MemoryStore.checkStaleness(conversation.id)

          // Skip if too many nudges already
          if (isStale && nudgeCount >= 2) {
            continue
          }

          // Generate and send message
          const message = await this.generateAgentMessage(
            agent,
            config,
            conversation,
            employee.full_name,
            isStale
          )

          if (message) {
            await this.adapter.sendMessage(conversation.id, message)
            messagesSent++

            if (isStale) {
              await MemoryStore.incrementNudgeCount(conversation.id)
            }
          }

          conversationsTouched++
        } catch (err) {
          console.error(`Failed to process employee ${employee.user_id}:`, err)
        }
      }

      // Update run as completed
      await supabase
        .from('agent_runs')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          messages_sent: messagesSent,
          conversations_touched: conversationsTouched,
        })
        .eq('id', run.id)

    } catch (err) {
      // Update run as failed
      await supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: err instanceof Error ? err.message : 'Unknown error',
        })
        .eq('id', run.id)

      throw err
    }

    return {
      runId: run.id,
      messagesSent,
      conversationsTouched,
    }
  }

  /**
   * Handle an employee reply
   */
  async handleEmployeeReply(
    conversationId: string,
    content: string,
    senderId: string
  ): Promise<{ response: Message | null; escalated: boolean }> {
    const supabase = await createClient()

    // Save employee message
    const { data: employeeMessage, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'employee',
        sender_id: senderId,
        content,
        content_type: 'text',
      })
      .select()
      .single()

    if (msgError) {
      throw new Error(`Failed to save message: ${msgError.message}`)
    }

    // Check for policy violations / escalations
    const policyCheck = PolicyGuard.checkEmployeeMessage(content)

    if (policyCheck.requiresEscalation) {
      // Create escalation
      const context = await MemoryStore.getConversationContext(conversationId)
      if (!context) {
        throw new Error('Conversation context not found')
      }

      await supabase
        .from('agent_escalations')
        .insert({
          conversation_id: conversationId,
          company_id: context.conversation.company_id,
          trigger_message_id: employeeMessage.id,
          escalation_type: policyCheck.escalationType || 'urgent',
          severity: policyCheck.escalationType === 'safety' ? 'critical' : 'high',
          description: `Triggered by message content: ${PolicyGuard.redact(content).substring(0, 200)}`,
        })

      // Update conversation status
      await supabase
        .from('conversations')
        .update({ status: 'escalated' })
        .eq('id', conversationId)

      // Send escalation message to employee
      const escalationMessage = PolicyGuard.generateEscalationMessage(
        policyCheck.escalationType || 'urgent',
        context.participantName
      )

      const response = await this.adapter.sendMessage(conversationId, escalationMessage, {
        type: 'escalation',
        escalation_type: policyCheck.escalationType,
      })

      return { response, escalated: true }
    }

    // Generate and send agent response
    const context = await MemoryStore.getConversationContext(conversationId)
    if (!context) {
      throw new Error('Conversation context not found')
    }

    // Get agent instance and template
    const { data: instance } = await supabase
      .from('agent_instances')
      .select(`*, agents (*)`)
      .eq('id', context.conversation.agent_instance_id)
      .single()

    if (!instance) {
      throw new Error('Agent instance not found')
    }

    const agent = instance.agents as Agent
    const config = instance.config as AgentInstanceConfig

    // Generate response
    const responseText = await this.generateAgentResponse(
      agent,
      config,
      context.messages,
      content,
      context.participantName
    )

    if (responseText) {
      // Check response against policy
      const responseCheck = PolicyGuard.checkAgentMessage(responseText)
      if (!responseCheck.allowed) {
        console.error('Agent response blocked by policy:', responseCheck.violations)
        return { response: null, escalated: false }
      }

      const response = await this.adapter.sendMessage(conversationId, responseText)

      // Update summary asynchronously
      this.updateConversationSummary(conversationId, context.participantName).catch(console.error)

      return { response, escalated: false }
    }

    return { response: null, escalated: false }
  }

  /**
   * Generate an opening or follow-up message from the agent
   */
  private async generateAgentMessage(
    agent: Agent,
    config: AgentInstanceConfig,
    conversation: Conversation,
    employeeName: string,
    isNudge: boolean = false
  ): Promise<string | null> {
    // Get conversation context
    const context = await MemoryStore.getConversationContext(conversation.id)

    // If no messages yet, send opening message
    if (!context || context.messages.length === 0) {
      // Try to use Anthropic for personalized opening
      if (isAnthropicConfigured()) {
        try {
          return await generateInitialMessage({
            employeeName,
            agentType: agent.agent_type,
            tonePreset: config.tone_preset,
          })
        } catch (error) {
          console.error('[Orchestrator] Failed to generate initial message with Claude:', error)
          // Fall through to static openings
        }
      }

      // Fallback to static openings
      const openings = OPENING_MESSAGES[agent.agent_type] || OPENING_MESSAGES.pulse_check
      return openings[Math.floor(Math.random() * openings.length)]
    }

    // Check last message - don't send if last message was from agent
    const lastMessage = context.messages[context.messages.length - 1]
    if (lastMessage.sender_type === 'agent' && !isNudge) {
      return null // Wait for employee reply
    }

    // If nudge, send gentle reminder
    if (isNudge) {
      const nudgeMessages = [
        `Hey ${employeeName.split(' ')[0]}! Just checking back - when you have a moment, I'd love to hear how things are going.`,
        `Quick ping! No pressure, but I'm here whenever you want to chat.`,
        `Hi! Just a friendly nudge. Happy to pick up our conversation whenever works for you.`,
      ]
      return nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)]
    }

    // Generate contextual follow-up (for demo, use pattern-based responses)
    return this.generateContextualResponse(context, config, employeeName)
  }

  /**
   * Generate agent response to employee message using Anthropic Claude
   */
  private async generateAgentResponse(
    agent: Agent,
    config: AgentInstanceConfig,
    previousMessages: Message[],
    employeeMessage: string,
    employeeName: string
  ): Promise<string> {
    // Try to use Anthropic Claude for real LLM responses
    if (isAnthropicConfigured()) {
      try {
        // Build conversation history
        const conversationHistory = previousMessages.map(m => ({
          role: m.sender_type === 'employee' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }))

        // Add the new user message
        conversationHistory.push({ role: 'user', content: employeeMessage })

        const context: AgentContext = {
          employeeName,
          agentType: agent.agent_type,
          tonePreset: config.tone_preset,
          conversationHistory,
        }

        const response = await generateAgentResponse(context)

        // If escalated, handle that separately
        if (response.shouldEscalate) {
          console.log('[Orchestrator] Claude detected escalation:', response.escalationType)
        }

        return response.content
      } catch (error) {
        console.error('[Orchestrator] Anthropic API error, falling back to pattern-based:', error)
        // Fall through to pattern-based response
      }
    }

    // Fallback: Simple pattern-based responses for demo
    const lowerMsg = employeeMessage.toLowerCase()
    const firstName = employeeName.split(' ')[0]

    // Sentiment-based responses
    if (/good|great|awesome|fantastic|love/i.test(lowerMsg)) {
      const positiveResponses = [
        `That's great to hear, ${firstName}! What's been the highlight?`,
        `Awesome! Anything specific that made it good?`,
        `Love hearing that! What's been working well?`,
      ]
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)]
    }

    if (/bad|terrible|stressed|overwhelmed|busy|tough/i.test(lowerMsg)) {
      const supportiveResponses = [
        `Thanks for being honest about that, ${firstName}. What's been the biggest challenge?`,
        `I hear you. Would you like to share more about what's making it tough?`,
        `That sounds challenging. Is there anything specific you think could help?`,
      ]
      return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)]
    }

    if (/manager|boss|lead/i.test(lowerMsg)) {
      return "How's the relationship with your manager been lately? Getting the support you need?"
    }

    if (/workload|busy|too much|projects/i.test(lowerMsg)) {
      return "Workload can really pile up. Is it a temporary crunch or feeling more ongoing?"
    }

    if (/thank|thanks/i.test(lowerMsg)) {
      return `You're welcome, ${firstName}! Feel free to reach out anytime. Have a great week!`
    }

    // Default follow-up questions
    const followUps = [
      `Thanks for sharing that, ${firstName}. Anything else on your mind?`,
      `Got it! Is there anything you'd like to see improve?`,
      `Appreciate you sharing. How's the team dynamic feeling?`,
      `Thanks! Quick follow-up - how's work-life balance been lately?`,
    ]

    return followUps[Math.floor(Math.random() * followUps.length)]
  }

  /**
   * Generate contextual response based on conversation history
   */
  private generateContextualResponse(
    context: { messages: Message[]; latestSummary: { tags: string[] } | null },
    config: AgentInstanceConfig,
    employeeName: string
  ): string {
    const firstName = employeeName.split(' ')[0]
    const tags = context.latestSummary?.tags || []

    // Reference previous topics
    if (tags.includes('workload')) {
      return `Hey ${firstName}! Last time we talked about workload - any better this week?`
    }

    if (tags.includes('manager')) {
      return `Hi ${firstName}! How's things with your manager going since we last checked in?`
    }

    // Default weekly check-in
    const weeklyQuestions = [
      `Hey ${firstName}! Quick pulse check - how's the week treating you?`,
      `Hi! Just checking in. How are you feeling about work lately?`,
      `Hey there! What's been on your mind this week?`,
    ]

    return weeklyQuestions[Math.floor(Math.random() * weeklyQuestions.length)]
  }

  /**
   * Update conversation summary after new messages
   */
  private async updateConversationSummary(
    conversationId: string,
    participantName: string
  ): Promise<void> {
    const supabase = await createClient()

    // Get full context
    const context = await MemoryStore.getConversationContext(conversationId, 50)
    if (!context || context.messages.length < 2) {
      return // Not enough messages to summarize
    }

    // Run analysis
    const analysis = InsightExtractor.analyze(
      context.messages,
      participantName,
      context.latestSummary
    )

    // Get message range
    const messageIds = context.messages.map(m => m.id)
    const startId = messageIds[0]
    const endId = messageIds[messageIds.length - 1]

    // Insert new summary
    await supabase
      .from('feedback_summaries')
      .insert({
        conversation_id: conversationId,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        tags: analysis.tags,
        action_items: analysis.action_items,
        key_quotes: analysis.key_quotes,
        message_range_start: startId,
        message_range_end: endId,
        previous_summary_id: context.latestSummary?.id || null,
        delta_notes: analysis.delta_notes,
        computed_at: analysis.computed_at,
      })
  }
}

// Export singleton instance
export const orchestrator = new AgentOrchestrator()
