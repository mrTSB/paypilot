// AI Agents Module - Type Definitions

export type AgentType = 'pulse_check' | 'onboarding' | 'exit_interview' | 'manager_coaching' | 'policy_qa' | 'custom'

export type TonePreset = 'friendly_peer' | 'professional_hr' | 'witty_safe' | 'poke_lite'

export type Cadence = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'

export type AudienceType = 'company_wide' | 'team' | 'role' | 'department' | 'individual'

export type SenderType = 'employee' | 'agent' | 'system'

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed'

export type EscalationType = 'safety' | 'harassment' | 'discrimination' | 'urgent' | 'manual'

export type ConversationStatus = 'active' | 'paused' | 'escalated' | 'closed'

export type AgentInstanceStatus = 'draft' | 'active' | 'paused' | 'archived'

// Database row types
export interface Agent {
  id: string
  name: string
  slug: string
  description: string | null
  agent_type: AgentType
  base_prompt: string
  tools_allowed: string[]
  default_config: Record<string, unknown>
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface AgentInstance {
  id: string
  company_id: string
  agent_id: string
  created_by: string
  name: string
  config: AgentInstanceConfig
  status: AgentInstanceStatus
  version: number
  created_at: string
  updated_at: string
  // Joined data
  agent?: Agent
  schedule?: AgentSchedule
}

export interface AgentInstanceConfig {
  tone_preset: TonePreset
  audience_type: AudienceType
  audience_filter?: {
    team_ids?: string[]
    role_ids?: string[]
    department?: string
    employee_ids?: string[]
  }
  guardrails: {
    no_sensitive_topics: boolean
    no_medical_legal: boolean
    no_coercion: boolean
    no_harassment: boolean
    custom_restrictions?: string[]
  }
  custom_prompt?: string
}

export interface AgentSchedule {
  id: string
  agent_instance_id: string
  cadence: Cadence
  cron_expression: string | null
  timezone: string
  next_run_at: string | null
  last_run_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  company_id: string
  agent_instance_id: string
  participant_user_id: string
  status: ConversationStatus
  last_message_at: string | null
  last_touched_at: string | null
  message_count: number
  unread_count: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined data
  agent_instance?: AgentInstance
  participant?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  messages?: Message[]
  latest_summary?: FeedbackSummary
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: SenderType
  sender_id: string | null
  content: string
  content_type: 'text' | 'quick_reply' | 'card' | 'escalation'
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface AgentRun {
  id: string
  agent_instance_id: string
  run_type: 'scheduled' | 'manual' | 'reply' | 'nudge'
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  finished_at: string | null
  messages_sent: number
  conversations_touched: number
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface FeedbackSummary {
  id: string
  conversation_id: string
  summary: string
  sentiment: Sentiment
  sentiment_score: number | null
  tags: string[]
  action_items: ActionItem[]
  key_quotes: string[]
  message_range_start: string | null
  message_range_end: string | null
  previous_summary_id: string | null
  delta_notes: string | null
  computed_at: string
  created_at: string
}

export interface ActionItem {
  text: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  category?: string
}

export interface Escalation {
  id: string
  conversation_id: string
  company_id: string
  trigger_message_id: string | null
  escalation_type: EscalationType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string | null
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed'
  assigned_to: string | null
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface TonePresetConfig {
  id: string
  slug: TonePreset
  name: string
  description: string | null
  system_prompt_modifier: string
  constraints: {
    max_formality: number
    emoji_allowed: boolean
    humor_level: 'none' | 'light' | 'medium'
    max_chars?: number
    questions_per_message?: number
  }
  example_messages: string[]
  is_system: boolean
  created_at: string
}

// API Request/Response types
export interface CreateAgentInstanceRequest {
  agent_id: string
  name: string
  config: AgentInstanceConfig
  schedule: {
    cadence: Cadence
    cron_expression?: string
    timezone?: string
  }
}

export interface SendMessageRequest {
  content: string
}

export interface TriggerAgentRequest {
  target_employees?: string[]
}

// Insight aggregations
export interface InsightFeed {
  recent_summaries: (FeedbackSummary & {
    conversation: Conversation
    participant_name: string
  })[]
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
    mixed: number
  }
  top_tags: { tag: string; count: number }[]
  action_items: (ActionItem & { conversation_id: string; participant_name: string })[]
  escalations: Escalation[]
  delta_highlights: {
    improved: string[]
    declined: string[]
    new_concerns: string[]
  }
}
