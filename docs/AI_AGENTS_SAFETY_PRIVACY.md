# AI Agents - Safety & Privacy Documentation

## Overview

PayPilot's AI Agents module enables automated employee engagement through conversational agents. This document outlines the data collection practices, privacy controls, and safety mechanisms built into the system.

## Data Collection

### What Data is Collected

1. **Conversation Messages**
   - Employee responses to agent prompts
   - Agent-generated messages
   - System messages (escalations, notifications)

2. **Metadata**
   - Timestamps for all interactions
   - Message read status
   - Conversation status (active, paused, escalated, closed)

3. **Derived Insights**
   - Sentiment analysis (positive/neutral/negative/mixed)
   - Topic tags (workload, manager, culture, etc.)
   - Action items with confidence scores
   - Key quotes (employee-selected for highlighting)
   - Summary text generated from conversations

### What Data is NOT Collected

- Personal health information (PHI)
- Social Security Numbers
- Bank account or financial details
- Immigration status
- Medical diagnoses or conditions
- Any information explicitly blocked by PolicyGuard

## Data Storage

### Database Tables

| Table | Purpose | Retention |
|-------|---------|-----------|
| `conversations` | Tracks conversation sessions | Indefinite (anonymizable) |
| `messages` | Stores all message content | Indefinite (anonymizable) |
| `feedback_summaries` | AI-generated insights | Indefinite |
| `agent_escalations` | Safety escalation records | 7 years (compliance) |

### Encryption

- Data at rest: Encrypted via Supabase (AES-256)
- Data in transit: TLS 1.3
- Sensitive fields: Redacted in logs via PolicyGuard

## Access Control

### Row Level Security (RLS)

All tables use PostgreSQL Row Level Security with the following policies:

#### Employees
- Can view and respond to their own conversations
- Cannot see other employees' conversations
- Cannot access feedback summaries or insights

#### Managers
- Can view conversations of their direct reports
- Can view aggregated insights for their team
- Cannot modify conversation content

#### HR Managers / Admins
- Can view all conversations company-wide
- Can view all insights and summaries
- Can create and configure agents
- Can manage escalations
- Cannot impersonate employees in conversations

#### Owners
- Full access to all agent-related data
- Can archive or delete agent instances

## Safety Guardrails

### PolicyGuard System

The `PolicyGuard` class enforces content safety:

#### Employee Message Checks
- Detects potential self-harm indicators
- Identifies harassment or discrimination reports
- Flags safety concerns for immediate escalation
- All flagged content triggers HR notification

#### Agent Message Checks
- Blocks requests for sensitive information (SSN, bank details, medical info)
- Prevents manipulative language patterns
- Enforces message length limits
- Validates tone compliance

### Escalation Protocol

When serious issues are detected:

1. **Immediate**: Conversation marked as `escalated`
2. **Notification**: HR admin receives alert
3. **Employee**: Receives supportive message with resources
4. **Logging**: Escalation recorded with severity level

### Severity Levels

| Level | Trigger | Response Time |
|-------|---------|---------------|
| Critical | Self-harm, violence | Immediate |
| High | Harassment, discrimination | < 4 hours |
| Medium | Workplace concerns | < 24 hours |
| Low | General feedback | Standard review |

## Agent Behavior Constraints

### What Agents Will NOT Do

1. **Never pretend to be human** - Always identify as AI assistant
2. **Never request sensitive information** - SSN, medical, financial, immigration
3. **Never provide therapy** - Direct to professional resources
4. **Never make promises** - About compensation, promotions, or policy changes
5. **Never be manipulative** - No guilt-tripping, pressure tactics, or coercion
6. **Never discuss other employees** - Maintain confidentiality

### Tone Presets

Each preset enforces specific constraints:

- **Poke-lite**: Max 240 chars, 1 question per message, light emoji
- **Professional HR**: No humor, formal language, no emoji
- **Friendly Peer**: Casual but appropriate, moderate emoji
- **Witty but Safe**: Light humor, never at anyone's expense

## Retention & Deletion

### Default Retention

- **Active conversations**: Retained while employee is active
- **Archived conversations**: Retained for 3 years
- **Escalation records**: Retained for 7 years (legal compliance)
- **Agent configurations**: Retained while company is active

### Data Deletion

Employees can request:
- Anonymization of their conversation data
- Deletion of non-essential metadata
- Export of their conversation history

Company admins can:
- Archive agent instances (soft delete)
- Request full data deletion through support

### Anonymization Process

When triggered:
1. Employee name → "Anonymous Employee"
2. Email → "redacted@example.com"
3. Message content → Retained for aggregate insights
4. Personal identifiers → Removed from summaries

## Compliance Considerations

### GDPR

- Right to access: Employees can export their data
- Right to erasure: Data deletion available on request
- Data portability: JSON export format available
- Purpose limitation: Data used only for stated purposes

### CCPA

- Disclosure: Clear documentation of data collection
- Opt-out: Employees can pause agent interactions
- Non-discrimination: Opting out doesn't affect employment

### SOC 2

- Access controls: RLS + role-based permissions
- Audit logging: All access logged to `audit_logs`
- Encryption: At rest and in transit
- Incident response: Escalation system with SLAs

## Audit Trail

All significant actions are logged to `audit_logs`:

- Agent creation/modification
- Escalation creation/resolution
- Data access by admins
- Configuration changes

Log entries include:
- Actor (user ID)
- Action performed
- Target resource
- Before/after state
- Timestamp
- IP address

## Employee Communication

### Transparency Requirements

Employees must be informed:
1. That AI agents are not human
2. What data is collected
3. Who can access their conversations
4. How to opt out or request data deletion
5. Escalation procedures for sensitive issues

### Recommended Disclosure

Include in employee handbook or onboarding:

> "PayPilot uses AI-powered assistants to gather feedback and support employee engagement. These assistants are clearly identified as AI and are designed to maintain confidentiality while flagging serious concerns to HR. Your responses are used to improve workplace experience and are accessible to authorized HR personnel."

## Contact & Support

For privacy concerns or data requests:
- Email: privacy@paypilot.com
- Response time: 48 hours

For safety escalations:
- Handled by assigned HR administrator
- Critical escalations: Immediate notification

---

*Last updated: February 2026*
*Version: 1.0*
