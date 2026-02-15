/**
 * Anthropic Claude Integration
 *
 * IMPORTANT: Never hardcode API keys. Use environment variables only.
 * The ANTHROPIC_API_KEY should be set in .env.local for local dev
 * and in Vercel environment variables for production.
 */

import Anthropic from '@anthropic-ai/sdk'

// Tone preset configurations
const TONE_SYSTEM_PROMPTS: Record<string, string> = {
  poke_lite: `You are PayPilot Pulse Assistant - a friendly, brief workplace check-in bot.

CRITICAL RULES:
- Keep ALL responses under 240 characters
- Be short, warm, and emoji-friendly
- Ask ONE question at a time, never multiple
- Never ask for sensitive info (SSN, medical, salary details, passwords)
- Never pressure or coerce - respect if someone doesn't want to share
- If someone mentions self-harm, harassment, or discrimination, respond with empathy and say their message has been flagged for HR support
- Stay professional but personable - like a friendly coworker`,

  friendly_peer: `You are PayPilot Assistant - a warm, conversational workplace check-in assistant.

CRITICAL RULES:
- Be warm and conversational, like a work friend checking in
- Keep responses concise (under 400 characters)
- Ask one focused question at a time
- Never ask for sensitive personal info
- Never pressure anyone to share more than they're comfortable with
- If concerning content (self-harm, harassment, discrimination) is mentioned, respond with empathy and note it will be flagged for HR support
- Acknowledge feelings before asking follow-up questions`,

  professional_hr: `You are PayPilot HR Assistant - a professional, supportive workplace feedback collector.

CRITICAL RULES:
- Maintain formal but supportive tone
- Keep responses under 500 characters
- One question per message, clearly stated
- Never request sensitive personal data
- Respect boundaries - if someone declines to elaborate, move on gracefully
- For safety concerns (self-harm, harassment, discrimination), express care and explain HR will follow up directly
- Focus on gathering actionable feedback while being empathetic`,

  witty_safe: `You are PayPilot Assistant - a workplace check-in bot with light, workplace-appropriate humor.

CRITICAL RULES:
- Use light humor that stays professional
- Keep responses under 350 characters
- One question at a time
- Humor should be inclusive - no jokes at anyone's expense
- Never ask for sensitive information
- If serious concerns arise (self-harm, harassment), drop the humor immediately and respond with genuine care
- Know when to be serious vs. light`,
}

// Agent type goal prompts
const AGENT_GOALS: Record<string, string> = {
  pulse_check: `Your goal is to gauge how the employee is feeling about work this week. Ask about:
- Their workload and stress levels
- Team dynamics and collaboration
- Any blockers or frustrations
- What's going well

Start with a friendly opener, then naturally progress through topics based on their responses.`,

  onboarding: `Your goal is to support a new hire through their onboarding journey. Focus on:
- How their first days/weeks are going
- Whether they have the resources they need
- If they feel welcomed by their team
- Any questions or confusion about processes

Be extra encouraging and reassuring.`,

  exit_interview: `Your goal is to gather honest feedback from a departing employee. Explore:
- Their overall experience at the company
- Reasons for leaving
- What could have been better
- What they'll miss

Be respectful and thank them for their honesty. This feedback is valuable.`,

  manager_coaching: `Your goal is to help a manager reflect on their leadership. Ask about:
- How their team is performing
- Challenges they're facing as a leader
- How supported they feel by leadership
- Areas where they'd like to grow

Offer encouragement and validate their efforts.`,
}

// Safety keywords that trigger escalation
const SAFETY_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self-harm',
  'harming myself',
  'hurt myself',
  'harassment',
  'harassed',
  'bullying',
  'bullied',
  'discriminate',
  'discrimination',
  'hostile work',
  'unsafe',
  'assault',
  'threatened',
  'abuse',
]

export interface AgentContext {
  employeeName: string
  employeeTitle?: string
  department?: string
  agentType: string
  tonePreset: string
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AgentResponse {
  content: string
  shouldEscalate: boolean
  escalationType?: 'safety' | 'harassment' | 'discrimination' | 'urgent'
  escalationReason?: string
}

/**
 * Check if Anthropic API key is configured
 */
export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

/**
 * Create Anthropic client - fails fast if key not configured
 */
function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set. Please configure it in .env.local or Vercel environment variables.')
  }

  // Never log the API key
  return new Anthropic({ apiKey })
}

/**
 * Check message for safety concerns
 */
function checkForSafetyConcerns(message: string): {
  hasConcern: boolean
  type?: 'safety' | 'harassment' | 'discrimination'
  keyword?: string
} {
  const lowerMessage = message.toLowerCase()

  for (const keyword of SAFETY_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      let type: 'safety' | 'harassment' | 'discrimination' = 'safety'

      if (['harassment', 'harassed', 'bullying', 'bullied', 'hostile work', 'threatened'].some(k => keyword.includes(k))) {
        type = 'harassment'
      } else if (['discriminate', 'discrimination'].some(k => keyword.includes(k))) {
        type = 'discrimination'
      }

      return { hasConcern: true, type, keyword }
    }
  }

  return { hasConcern: false }
}

/**
 * Generate agent response using Claude
 *
 * @param context - The conversation context
 * @returns Agent response with potential escalation info
 */
export async function generateAgentResponse(context: AgentContext): Promise<AgentResponse> {
  // Check for safety concerns in the latest user message
  const latestUserMessage = context.conversationHistory
    .filter(m => m.role === 'user')
    .pop()?.content || ''

  const safetyConcern = checkForSafetyConcerns(latestUserMessage)

  if (safetyConcern.hasConcern) {
    // Return empathetic response and flag for escalation
    const empathyResponse = getEmpathyResponse(safetyConcern.type!)

    return {
      content: empathyResponse,
      shouldEscalate: true,
      escalationType: safetyConcern.type,
      escalationReason: `Detected safety keyword: "${safetyConcern.keyword}" in employee message`,
    }
  }

  // Build the system prompt
  const tonePrompt = TONE_SYSTEM_PROMPTS[context.tonePreset] || TONE_SYSTEM_PROMPTS.friendly_peer
  const goalPrompt = AGENT_GOALS[context.agentType] || AGENT_GOALS.pulse_check

  const systemPrompt = `${tonePrompt}

${goalPrompt}

You're talking with ${context.employeeName}${context.employeeTitle ? `, ${context.employeeTitle}` : ''}${context.department ? ` in ${context.department}` : ''}.

Remember: Keep your response short and focused. One question or acknowledgment at a time.`

  // Create client and call API with retry logic
  const client = createAnthropicClient()

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: context.tonePreset === 'poke_lite' ? 100 : 200,
        system: systemPrompt,
        messages: context.conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
      })

      // Extract text content
      const textContent = response.content.find(c => c.type === 'text')
      const content = textContent?.text || "I'm here to listen. How are you doing today?"

      // Enforce character limits based on tone
      const maxChars = context.tonePreset === 'poke_lite' ? 240 :
        context.tonePreset === 'witty_safe' ? 350 :
        context.tonePreset === 'friendly_peer' ? 400 : 500

      const truncatedContent = content.length > maxChars
        ? content.substring(0, maxChars - 3) + '...'
        : content

      return {
        content: truncatedContent,
        shouldEscalate: false,
      }
    } catch (error: unknown) {
      attempts++

      if (attempts >= maxAttempts) {
        console.error('[Anthropic] Failed after max retries:', error)

        // Return a safe fallback response
        return {
          content: "Thanks for sharing. I'm having a moment - could you tell me more about how things are going?",
          shouldEscalate: false,
        }
      }

      // Exponential backoff
      const backoffMs = Math.pow(2, attempts) * 500
      console.log(`[Anthropic] Retry ${attempts}/${maxAttempts} after ${backoffMs}ms`)
      await new Promise(resolve => setTimeout(resolve, backoffMs))
    }
  }

  // Fallback (should not reach here)
  return {
    content: "How are things going for you this week?",
    shouldEscalate: false,
  }
}

/**
 * Get an empathetic response for safety concerns
 */
function getEmpathyResponse(concernType: 'safety' | 'harassment' | 'discrimination'): string {
  switch (concernType) {
    case 'safety':
      return "I hear you, and I want you to know that your wellbeing matters. I've flagged this for our HR team who will reach out to support you directly. You're not alone."

    case 'harassment':
      return "Thank you for trusting me with this. What you're describing sounds serious and you deserve support. I've flagged this for HR who will follow up with you confidentially."

    case 'discrimination':
      return "I appreciate you sharing this. Discrimination is never okay, and this deserves proper attention. I've flagged this for our HR team to follow up with you directly and confidentially."

    default:
      return "Thank you for sharing. This seems important and I've flagged it for our HR team to follow up with you personally."
  }
}

/**
 * Generate initial outreach message for an agent
 */
export async function generateInitialMessage(context: Omit<AgentContext, 'conversationHistory'>): Promise<string> {
  const tonePrompt = TONE_SYSTEM_PROMPTS[context.tonePreset] || TONE_SYSTEM_PROMPTS.friendly_peer
  const goalPrompt = AGENT_GOALS[context.agentType] || AGENT_GOALS.pulse_check

  const systemPrompt = `${tonePrompt}

${goalPrompt}

You're starting a new conversation with ${context.employeeName}${context.employeeTitle ? `, ${context.employeeTitle}` : ''}${context.department ? ` in ${context.department}` : ''}.

Generate a warm, engaging opening message that:
1. Greets them by first name
2. Explains you're checking in (briefly)
3. Asks ONE open-ended question to start

Keep it short and inviting.`

  if (!isAnthropicConfigured()) {
    // Fallback for when API key isn't configured
    const firstName = context.employeeName.split(' ')[0]
    return `Hey ${firstName}! I'm your PayPilot Pulse Assistant, checking in on how things are going. How's your week been so far?`
  }

  try {
    const client = createAnthropicClient()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate an opening message.' }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    return textContent?.text || `Hey ${context.employeeName.split(' ')[0]}! Just checking in - how are things going this week?`
  } catch (error) {
    console.error('[Anthropic] Error generating initial message:', error)
    const firstName = context.employeeName.split(' ')[0]
    return `Hey ${firstName}! I'm checking in to see how things are going. How's your week been?`
  }
}
