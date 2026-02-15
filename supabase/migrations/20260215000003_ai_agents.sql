-- ============================================================================
-- AI AGENTS MODULE - PayPilot
-- Orthogonal module for AI-powered employee engagement agents
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION (create if not exists)
-- ============================================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Agent templates/definitions (system-level)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('pulse_check', 'onboarding', 'exit_interview', 'manager_coaching', 'policy_qa', 'custom')),
  base_prompt TEXT NOT NULL,
  tools_allowed JSONB DEFAULT '[]'::jsonb,
  default_config JSONB DEFAULT '{}'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent instances (company-specific deployments)
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Config includes: tone_preset, audience_type, audience_filter, guardrails
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_instances_company ON agent_instances(company_id);
CREATE INDEX idx_agent_instances_status ON agent_instances(status);

-- Agent schedules (when to trigger)
CREATE TABLE agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL CHECK (cadence IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  cron_expression TEXT, -- For custom cadence
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_schedules_next_run ON agent_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_agent_schedules_instance ON agent_schedules(agent_instance_id);

-- Conversations (one per employee per agent instance)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  participant_user_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'escalated', 'closed')),
  last_message_at TIMESTAMPTZ,
  last_touched_at TIMESTAMPTZ DEFAULT now(),
  message_count INT DEFAULT 0,
  unread_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_conversations_unique ON conversations(agent_instance_id, participant_user_id);
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_participant ON conversations(participant_user_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages (conversation thread)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('employee', 'agent', 'system')),
  sender_id UUID, -- NULL for agent/system, user_id for employee
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'quick_reply', 'card', 'escalation')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id) WHERE is_read = false;

-- Agent runs (execution log)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (run_type IN ('scheduled', 'manual', 'reply', 'nudge')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  messages_sent INT DEFAULT 0,
  conversations_touched INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_instance ON agent_runs(agent_instance_id, created_at DESC);
CREATE INDEX idx_agent_runs_status ON agent_runs(status) WHERE status IN ('pending', 'running');

-- Feedback summaries (AI-generated insights per conversation)
CREATE TABLE feedback_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  tags JSONB DEFAULT '[]'::jsonb, -- ['workload', 'manager', 'culture']
  action_items JSONB DEFAULT '[]'::jsonb, -- [{text, confidence, priority}]
  key_quotes JSONB DEFAULT '[]'::jsonb, -- Notable employee quotes
  message_range_start UUID REFERENCES messages(id),
  message_range_end UUID REFERENCES messages(id),
  previous_summary_id UUID REFERENCES feedback_summaries(id),
  delta_notes TEXT, -- What changed since last summary
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_summaries_conversation ON feedback_summaries(conversation_id, computed_at DESC);
CREATE INDEX idx_feedback_summaries_sentiment ON feedback_summaries(sentiment);
CREATE INDEX idx_feedback_summaries_computed ON feedback_summaries(computed_at DESC);

-- Escalations (when agent detects serious issues)
CREATE TABLE agent_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trigger_message_id UUID REFERENCES messages(id),
  escalation_type TEXT NOT NULL CHECK (escalation_type IN ('safety', 'harassment', 'discrimination', 'urgent', 'manual')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES profiles(id),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escalations_company ON agent_escalations(company_id, status);
CREATE INDEX idx_escalations_open ON agent_escalations(status) WHERE status = 'open';

-- ============================================================================
-- TONE PRESETS (stored as config reference)
-- ============================================================================

CREATE TABLE tone_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt_modifier TEXT NOT NULL,
  constraints JSONB DEFAULT '{}'::jsonb,
  example_messages JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tone_presets ENABLE ROW LEVEL SECURITY;

-- Agents: system templates readable by all authenticated
CREATE POLICY "agents_read_system" ON agents
  FOR SELECT TO authenticated
  USING (is_system = true);

-- Agent instances: company members can read, admins can manage
CREATE POLICY "agent_instances_read" ON agent_instances
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agent_instances_insert" ON agent_instances
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

CREATE POLICY "agent_instances_update" ON agent_instances
  FOR UPDATE TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Agent schedules: follow agent instance access
CREATE POLICY "agent_schedules_read" ON agent_schedules
  FOR SELECT TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "agent_schedules_manage" ON agent_schedules
  FOR ALL TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
      )
    )
  );

-- Conversations: employees see their own, admins see all in company
CREATE POLICY "conversations_read_own" ON conversations
  FOR SELECT TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
    )
  );

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Messages: follow conversation access
CREATE POLICY "messages_read" ON messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        participant_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM company_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
        )
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        participant_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM company_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
        )
    )
  );

-- Agent runs: admins only
CREATE POLICY "agent_runs_read" ON agent_runs
  FOR SELECT TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
      )
    )
  );

-- Feedback summaries: admins see all, employees see limited
CREATE POLICY "feedback_summaries_admin_read" ON feedback_summaries
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
      )
    )
  );

-- Escalations: admins only
CREATE POLICY "escalations_read" ON agent_escalations
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

CREATE POLICY "escalations_manage" ON agent_escalations
  FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Tone presets: readable by all
CREATE POLICY "tone_presets_read" ON tone_presets
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversation stats on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_touched_at = NEW.created_at,
    message_count = message_count + 1,
    unread_count = CASE
      WHEN NEW.sender_type = 'agent' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_message_insert
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Auto-update updated_at
CREATE TRIGGER trg_agent_instances_updated
BEFORE UPDATE ON agent_instances
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agent_schedules_updated
BEFORE UPDATE ON agent_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_escalations_updated
BEFORE UPDATE ON agent_escalations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED SYSTEM DATA
-- ============================================================================

-- Insert system tone presets
INSERT INTO tone_presets (slug, name, description, system_prompt_modifier, constraints, example_messages, is_system) VALUES
('friendly_peer', 'Friendly Peer', 'Casual and approachable, like a colleague',
'Communicate like a friendly coworker. Use casual language, contractions, and occasional emoji. Be warm but not overly familiar.',
'{"max_formality": 3, "emoji_allowed": true, "humor_level": "light"}'::jsonb,
'["Hey! Quick check-in - how''s your week going so far? 🙂", "Thanks for sharing that! Sounds like things are moving along."]'::jsonb,
true),

('professional_hr', 'Professional HR', 'Formal and supportive HR tone',
'Communicate professionally as an HR representative. Use proper grammar, be supportive and empathetic, but maintain appropriate boundaries.',
'{"max_formality": 8, "emoji_allowed": false, "humor_level": "none"}'::jsonb,
'["Good afternoon. I wanted to check in regarding your experience this week.", "Thank you for your feedback. Your input is valuable to us."]'::jsonb,
true),

('witty_safe', 'Witty but Safe', 'Light humor while staying appropriate',
'Use light humor and wit to keep conversations engaging, but never at anyone''s expense. Stay positive and inclusive.',
'{"max_formality": 4, "emoji_allowed": true, "humor_level": "medium"}'::jsonb,
'["Time for our weekly chat! Promise this won''t feel like a dentist appointment 😄", "That''s great to hear! High five through the screen ✋"]'::jsonb,
true),

('poke_lite', 'Poke-lite', 'Short, playful, never manipulative - inspired by Poke',
'Be brief, friendly, and slightly playful. Ask ONE question at a time, max 240 characters. Never guilt-trip or manipulate. Reference previous conversations when relevant. If someone seems stressed, be supportive without being therapy-like.',
'{"max_formality": 2, "emoji_allowed": true, "humor_level": "light", "max_chars": 240, "questions_per_message": 1}'::jsonb,
'["Hey! One quick q: How''s the workload feeling this week? 📊", "Got it! Last time you mentioned projects piling up - any better?", "Thanks for the honesty. That''s helpful to know 💪"]'::jsonb,
true);

-- Insert system agent templates
INSERT INTO agents (slug, name, description, agent_type, base_prompt, tools_allowed, default_config, is_system) VALUES
('pulse_check', 'Pulse Check', 'Weekly check-in to gauge employee sentiment and surface issues early', 'pulse_check',
'You are PayPilot''s Pulse Assistant. You are NOT a human - always be transparent about being an AI assistant.

Your job: Get honest employee feedback with minimal burden. Help surface workplace issues before they become problems.

RULES:
1. Ask ONE question at a time, max 240 characters
2. Be conversational and natural, not robotic
3. Reference previous conversations when relevant ("Last time you mentioned X...")
4. If this is a first conversation, introduce yourself briefly

NEVER:
- Ask for medical info, immigration status, SSN, bank details, or anything illegal
- Pretend to be human
- Be manipulative or guilt-trippy
- Provide therapy or medical advice
- Make promises you can''t keep

IF employee indicates self-harm, harassment, discrimination, or safety risk:
- Express care and concern
- Tell them you''re routing to HR for proper support
- End the automated conversation

TOPICS TO EXPLORE (vary by conversation):
- Workload and stress levels
- Team dynamics and collaboration
- Manager relationship
- Tools and resources
- Growth and development
- Work-life balance
- Company culture

Start conversations with a simple, warm check-in. Build rapport over time.',
'["memory", "escalate", "summarize"]'::jsonb,
'{"default_tone": "poke_lite", "default_cadence": "weekly"}'::jsonb,
true),

('onboarding', 'Onboarding Buddy', 'Help new hires get settled and surface early friction', 'onboarding',
'You are PayPilot''s Onboarding Buddy. You help new employees feel welcome and ensure their first weeks go smoothly.

Your job: Check in with new hires, answer common questions, and flag issues to HR.

APPROACH:
- Be warm and welcoming
- Ask about their onboarding experience
- Check if they have what they need (equipment, access, introductions)
- Identify any blockers or confusion early

NEVER:
- Answer policy questions definitively - always suggest checking with HR
- Make promises about compensation, benefits, or job changes
- Pretend to be human',
'["memory", "escalate", "summarize", "handoff_hr"]'::jsonb,
'{"default_tone": "friendly_peer", "default_cadence": "daily", "duration_days": 30}'::jsonb,
true),

('exit_interview', 'Exit Interview', 'Gather candid feedback from departing employees', 'exit_interview',
'You are PayPilot''s Exit Interview Assistant. You help gather honest feedback from employees who are leaving.

Your job: Create a safe space for departing employees to share their experience and suggestions.

APPROACH:
- Thank them for their time at the company
- Ask open-ended questions about their experience
- Probe gently on areas of improvement
- Focus on actionable feedback

TOPICS:
- Reasons for leaving (without pressure)
- What they enjoyed most
- What could be improved
- Manager and team dynamics
- Advice for the company

Be respectful that this may be an emotional time.',
'["memory", "summarize"]'::jsonb,
'{"default_tone": "professional_hr", "default_cadence": "once"}'::jsonb,
true),

('manager_coaching', 'Manager Coaching', 'Help managers improve their leadership skills', 'manager_coaching',
'You are PayPilot''s Manager Coach. You help managers reflect on their leadership and identify growth areas.

Your job: Prompt reflection, share best practices, and help managers support their teams better.

APPROACH:
- Ask about recent team interactions
- Prompt reflection on what went well and what could improve
- Share relevant management tips when appropriate
- Be supportive, not judgmental

NEVER:
- Criticize specific employees
- Make HR decisions
- Override company policy',
'["memory", "summarize"]'::jsonb,
'{"default_tone": "professional_hr", "default_cadence": "weekly"}'::jsonb,
true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get next run time based on cadence
CREATE OR REPLACE FUNCTION calculate_next_run(
  p_cadence TEXT,
  p_timezone TEXT DEFAULT 'America/New_York',
  p_from_time TIMESTAMPTZ DEFAULT now()
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_time TIMESTAMPTZ;
BEGIN
  CASE p_cadence
    WHEN 'daily' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '1 day')::date + TIME '09:00:00';
    WHEN 'weekly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '7 days')::date + TIME '09:00:00';
    WHEN 'biweekly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '14 days')::date + TIME '09:00:00';
    WHEN 'monthly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '1 month')::date + TIME '09:00:00';
    WHEN 'once' THEN
      next_time := NULL;
    ELSE
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '7 days')::date + TIME '09:00:00';
  END CASE;

  RETURN next_time AT TIME ZONE p_timezone;
END;
$$ LANGUAGE plpgsql;

-- Claim due schedules for processing (with row locking)
CREATE OR REPLACE FUNCTION claim_due_schedules(p_limit INT DEFAULT 10)
RETURNS TABLE(schedule_id UUID, instance_id UUID, company_id UUID) AS $$
BEGIN
  RETURN QUERY
  WITH due_schedules AS (
    SELECT s.id, s.agent_instance_id
    FROM agent_schedules s
    JOIN agent_instances i ON s.agent_instance_id = i.id
    WHERE s.is_active = true
      AND s.next_run_at <= now()
      AND i.status = 'active'
    ORDER BY s.next_run_at
    LIMIT p_limit
    FOR UPDATE OF s SKIP LOCKED
  )
  UPDATE agent_schedules
  SET
    last_run_at = now(),
    next_run_at = calculate_next_run(cadence, timezone),
    updated_at = now()
  FROM due_schedules
  WHERE agent_schedules.id = due_schedules.id
  RETURNING
    agent_schedules.id AS schedule_id,
    agent_schedules.agent_instance_id AS instance_id,
    (SELECT ai.company_id FROM agent_instances ai WHERE ai.id = agent_schedules.agent_instance_id) AS company_id;
END;
$$ LANGUAGE plpgsql;
