// PolicyGuard - Content safety and compliance checks

const SENSITIVE_PATTERNS = {
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
  credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi,
  bank_account: /\b\d{8,17}\b/gi,
  medical_terms: /\b(diagnosis|prescription|medication|treatment|doctor|hospital|surgery|illness|disease|symptom|patient)\b/gi,
  immigration: /\b(visa|green card|citizenship|immigration|deportation|asylum|work permit|h1b|i-9)\b/gi,
  self_harm: /\b(suicide|kill myself|end my life|self harm|hurt myself|don't want to live|want to die)\b/gi,
  harassment: /\b(harass|bully|threat|intimidat|discriminat|hostile|assault|abuse)\b/gi,
  legal_terms: /\b(lawsuit|sue|attorney|lawyer|legal action|settlement|court|subpoena)\b/gi,
}

const ESCALATION_TRIGGERS = {
  safety: [
    /\b(suicide|kill myself|end my life|self harm|hurt myself|don't want to live|want to die)\b/gi,
    /\b(violence|weapon|gun|knife|bomb|threat)\b/gi,
  ],
  harassment: [
    /\b(sexual harassment|harassing me|being harassed|hostile work|bullying|bully)\b/gi,
    /\b(inappropriate touch|unwanted advance|quid pro quo)\b/gi,
  ],
  discrimination: [
    /\b(discriminat|racist|sexist|ageist|homophob|transphob)\b/gi,
    /\b(fired because|passed over for|denied promotion due to)\b/gi,
  ],
}

export interface PolicyCheckResult {
  allowed: boolean
  violations: PolicyViolation[]
  redactedContent?: string
  requiresEscalation: boolean
  escalationType?: 'safety' | 'harassment' | 'discrimination' | 'urgent'
}

export interface PolicyViolation {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  matchedText?: string
}

export class PolicyGuard {
  /**
   * Check if content from an employee should be flagged or escalated
   */
  static checkEmployeeMessage(content: string): PolicyCheckResult {
    const violations: PolicyViolation[] = []
    let requiresEscalation = false
    let escalationType: 'safety' | 'harassment' | 'discrimination' | 'urgent' | undefined

    // Check for escalation triggers (most important)
    for (const [type, patterns] of Object.entries(ESCALATION_TRIGGERS)) {
      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match) {
          requiresEscalation = true
          escalationType = type as typeof escalationType
          violations.push({
            type: `escalation_${type}`,
            description: `Content indicates potential ${type} issue`,
            severity: type === 'safety' ? 'critical' : 'high',
            matchedText: match[0],
          })
        }
      }
    }

    return {
      allowed: true, // Always allow employee messages, but flag them
      violations,
      requiresEscalation,
      escalationType,
    }
  }

  /**
   * Check if content from an agent is safe to send
   */
  static checkAgentMessage(content: string): PolicyCheckResult {
    const violations: PolicyViolation[] = []

    // Agent should never ask for sensitive info
    const sensitiveAsks = [
      { pattern: /what('s| is) your (ssn|social security)/gi, type: 'ssn_request' },
      { pattern: /bank (account|routing|details)/gi, type: 'bank_request' },
      { pattern: /credit card/gi, type: 'cc_request' },
      { pattern: /medical (history|condition|diagnosis)/gi, type: 'medical_request' },
      { pattern: /immigration (status|visa)/gi, type: 'immigration_request' },
    ]

    for (const { pattern, type } of sensitiveAsks) {
      if (pattern.test(content)) {
        violations.push({
          type,
          description: `Agent attempted to request ${type.replace('_', ' ')}`,
          severity: 'high',
        })
      }
    }

    // Check message length (Poke-lite constraint)
    if (content.length > 500) {
      violations.push({
        type: 'message_too_long',
        description: 'Agent message exceeds recommended length',
        severity: 'low',
      })
    }

    // Check for manipulation patterns
    const manipulationPatterns = [
      /you (have to|must|need to) (tell|share|respond)/gi,
      /why (won't|don't) you (answer|respond|tell)/gi,
      /disappointed (in|with) you/gi,
      /everyone else (is|has)/gi,
    ]

    for (const pattern of manipulationPatterns) {
      if (pattern.test(content)) {
        violations.push({
          type: 'manipulation_attempt',
          description: 'Message contains potentially manipulative language',
          severity: 'medium',
        })
      }
    }

    return {
      allowed: violations.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0,
      violations,
      requiresEscalation: false,
    }
  }

  /**
   * Redact sensitive information from content for logging/display
   */
  static redact(content: string): string {
    let redacted = content

    // Redact SSN
    redacted = redacted.replace(SENSITIVE_PATTERNS.ssn, '[SSN REDACTED]')

    // Redact credit cards
    redacted = redacted.replace(SENSITIVE_PATTERNS.credit_card, '[CC REDACTED]')

    // Redact bank accounts (only if clearly a number sequence)
    redacted = redacted.replace(/\b(account|routing)[\s#:]+\d{6,17}\b/gi, '[ACCOUNT REDACTED]')

    return redacted
  }

  /**
   * Generate escalation message for HR
   */
  static generateEscalationMessage(
    escalationType: 'safety' | 'harassment' | 'discrimination' | 'urgent',
    employeeName: string
  ): string {
    const messages: Record<typeof escalationType, string> = {
      safety: `I want to make sure you're okay. What you've shared sounds serious, and I want you to know that support is available. I'm connecting you with HR right now so a real person can help. In the meantime, if you're in immediate danger, please contact emergency services (911) or the National Crisis Hotline (988).`,
      harassment: `Thank you for sharing this with me. What you've described is important and needs proper attention. I'm flagging this for HR review so someone can follow up with you directly and confidentially. You're not alone in this.`,
      discrimination: `I hear you, and I want you to know that what you've described is being taken seriously. I'm routing this to HR for proper review. Someone will reach out to you directly to discuss next steps.`,
      urgent: `This sounds urgent and important. I'm making sure the right people see this right away. Someone from HR will be in touch with you soon.`,
    }

    return messages[escalationType] || messages.urgent
  }

  /**
   * Check if agent should stop conversation and route to human
   */
  static shouldRouteToHuman(violations: PolicyViolation[]): boolean {
    return violations.some(v =>
      v.severity === 'critical' ||
      v.type.startsWith('escalation_')
    )
  }
}
