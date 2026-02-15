// InsightExtractor - Generate summaries, sentiment, and action items from conversations

import { Message, FeedbackSummary, ActionItem, Sentiment } from './types'

// Topic detection patterns
const TOPIC_PATTERNS: Record<string, RegExp[]> = {
  workload: [
    /\b(overwhelm|too much|busy|stress|swamp|behind|deadline|overwork|burnout|exhausted)\b/gi,
    /\b(workload|work load|tasks|projects|bandwidth)\b/gi,
  ],
  manager: [
    /\b(manager|boss|supervisor|lead|leadership)\b/gi,
    /\b(1:1|one-on-one|check-in|feedback)\b/gi,
  ],
  compensation: [
    /\b(salary|pay|compensation|raise|bonus|equity|stock|benefits)\b/gi,
    /\b(underpaid|market rate|promotion)\b/gi,
  ],
  culture: [
    /\b(culture|values|team|environment|atmosphere|vibe)\b/gi,
    /\b(toxic|supportive|inclusive|diverse|belonging)\b/gi,
  ],
  tooling: [
    /\b(tools|software|systems|tech|equipment|laptop|slow)\b/gi,
    /\b(broken|outdated|frustrating|clunky)\b/gi,
  ],
  growth: [
    /\b(growth|career|development|learning|promotion|opportunity)\b/gi,
    /\b(stuck|stagnant|ceiling|path|progression)\b/gi,
  ],
  work_life_balance: [
    /\b(balance|hours|overtime|weekend|evening|family|life)\b/gi,
    /\b(burnout|exhausted|tired|rest|vacation|pto)\b/gi,
  ],
  communication: [
    /\b(communication|meeting|align|unclear|confus|info|update)\b/gi,
    /\b(siloed|disconnected|transparent|visibility)\b/gi,
  ],
  team_dynamics: [
    /\b(team|colleague|coworker|collaboration|conflict)\b/gi,
    /\b(friction|tension|support|help|trust)\b/gi,
  ],
  recognition: [
    /\b(recogni|appreciat|acknowledged|valued|seen|invisible)\b/gi,
    /\b(thank|credit|praised|noticed)\b/gi,
  ],
}

// Sentiment indicators
const SENTIMENT_INDICATORS = {
  positive: [
    /\b(great|good|love|enjoy|happy|excited|thrilled|fantastic|wonderful|excellent)\b/gi,
    /\b(grateful|thankful|appreciate|blessed|lucky|satisfied)\b/gi,
    /\b(improving|better|progress|growing|learning)\b/gi,
  ],
  negative: [
    /\b(bad|terrible|awful|hate|frustrated|annoyed|upset|angry|disappointed)\b/gi,
    /\b(struggle|difficult|hard|challenging|problem|issue)\b/gi,
    /\b(worried|concerned|anxious|stressed|overwhelmed)\b/gi,
    /\b(leaving|quit|resign|looking for|interview)\b/gi,
  ],
  neutral: [
    /\b(okay|fine|alright|normal|usual|same|average)\b/gi,
  ],
}

export class InsightExtractor {
  /**
   * Extract topics from messages
   */
  static extractTopics(messages: Message[]): string[] {
    const employeeMessages = messages.filter(m => m.sender_type === 'employee')
    const combinedText = employeeMessages.map(m => m.content).join(' ')

    const detectedTopics: Set<string> = new Set()

    for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(combinedText)) {
          detectedTopics.add(topic)
          break
        }
      }
    }

    return Array.from(detectedTopics)
  }

  /**
   * Analyze sentiment from messages
   */
  static analyzeSentiment(messages: Message[]): { sentiment: Sentiment; score: number } {
    const employeeMessages = messages.filter(m => m.sender_type === 'employee')
    const combinedText = employeeMessages.map(m => m.content).join(' ')

    let positiveScore = 0
    let negativeScore = 0

    for (const pattern of SENTIMENT_INDICATORS.positive) {
      const matches = combinedText.match(pattern)
      positiveScore += matches ? matches.length : 0
    }

    for (const pattern of SENTIMENT_INDICATORS.negative) {
      const matches = combinedText.match(pattern)
      negativeScore += matches ? matches.length : 0
    }

    const total = positiveScore + negativeScore
    if (total === 0) {
      return { sentiment: 'neutral', score: 0 }
    }

    const score = (positiveScore - negativeScore) / total // -1 to 1

    let sentiment: Sentiment
    if (score > 0.3) {
      sentiment = 'positive'
    } else if (score < -0.3) {
      sentiment = 'negative'
    } else if (positiveScore > 0 && negativeScore > 0) {
      sentiment = 'mixed'
    } else {
      sentiment = 'neutral'
    }

    return { sentiment, score: Math.round(score * 100) / 100 }
  }

  /**
   * Extract key quotes from employee messages
   */
  static extractKeyQuotes(messages: Message[], maxQuotes: number = 3): string[] {
    const employeeMessages = messages
      .filter(m => m.sender_type === 'employee')
      .filter(m => m.content.length > 20 && m.content.length < 300)
      .sort((a, b) => b.content.length - a.content.length)

    return employeeMessages
      .slice(0, maxQuotes)
      .map(m => m.content)
  }

  /**
   * Generate action items from conversation analysis
   */
  static generateActionItems(messages: Message[], topics: string[], sentiment: Sentiment): ActionItem[] {
    const actionItems: ActionItem[] = []
    const combinedText = messages
      .filter(m => m.sender_type === 'employee')
      .map(m => m.content)
      .join(' ')
      .toLowerCase()

    // High priority: burnout/leaving signals
    if (
      /\b(burnout|burning out|exhausted|overwhelmed)\b/gi.test(combinedText) ||
      /\b(leaving|looking for|interview|quit|resign)\b/gi.test(combinedText)
    ) {
      actionItems.push({
        text: 'Employee shows signs of burnout or may be considering leaving. Schedule 1:1 to discuss workload and career path.',
        confidence: 0.8,
        priority: 'high',
        category: 'retention_risk',
      })
    }

    // Workload issues
    if (topics.includes('workload') && sentiment !== 'positive') {
      actionItems.push({
        text: 'Review employee workload and consider redistributing tasks or adjusting deadlines.',
        confidence: 0.7,
        priority: 'medium',
        category: 'workload',
      })
    }

    // Manager relationship issues
    if (topics.includes('manager') && sentiment === 'negative') {
      actionItems.push({
        text: 'Manager relationship may need attention. Consider facilitating a feedback session.',
        confidence: 0.6,
        priority: 'medium',
        category: 'management',
      })
    }

    // Compensation concerns
    if (topics.includes('compensation')) {
      actionItems.push({
        text: 'Employee mentioned compensation. Review market rates and discuss total compensation package.',
        confidence: 0.7,
        priority: 'medium',
        category: 'compensation',
      })
    }

    // Growth concerns
    if (topics.includes('growth') && sentiment !== 'positive') {
      actionItems.push({
        text: 'Employee seeking growth opportunities. Discuss career development and potential learning paths.',
        confidence: 0.7,
        priority: 'medium',
        category: 'development',
      })
    }

    // Tooling frustrations
    if (topics.includes('tooling') && sentiment === 'negative') {
      actionItems.push({
        text: 'Review tools and systems that may be causing friction. Consider upgrades or training.',
        confidence: 0.5,
        priority: 'low',
        category: 'tooling',
      })
    }

    return actionItems
  }

  /**
   * Generate a natural language summary of the conversation
   */
  static generateSummary(
    messages: Message[],
    topics: string[],
    sentiment: Sentiment,
    participantName: string
  ): string {
    const employeeMessageCount = messages.filter(m => m.sender_type === 'employee').length

    if (employeeMessageCount === 0) {
      return 'No employee responses yet.'
    }

    const sentimentDescriptions: Record<Sentiment, string> = {
      positive: 'is feeling positive',
      neutral: 'has a neutral outlook',
      negative: 'is experiencing some challenges',
      mixed: 'has mixed feelings',
    }

    const topicList = topics.length > 0
      ? ` Topics discussed include ${topics.slice(0, 3).join(', ')}.`
      : ''

    return `${participantName} ${sentimentDescriptions[sentiment]}.${topicList}`
  }

  /**
   * Compare two summaries and generate delta notes
   */
  static compareSummaries(
    previousSummary: FeedbackSummary | null,
    currentSentiment: Sentiment,
    currentTopics: string[]
  ): string | null {
    if (!previousSummary) {
      return null
    }

    const changes: string[] = []

    // Compare sentiment
    if (previousSummary.sentiment !== currentSentiment) {
      if (
        (previousSummary.sentiment === 'negative' && currentSentiment === 'positive') ||
        (previousSummary.sentiment === 'negative' && currentSentiment === 'neutral')
      ) {
        changes.push('Sentiment has improved since last check-in')
      } else if (
        (previousSummary.sentiment === 'positive' && currentSentiment === 'negative') ||
        (previousSummary.sentiment === 'neutral' && currentSentiment === 'negative')
      ) {
        changes.push('Sentiment has declined since last check-in')
      }
    }

    // Compare topics
    const previousTopics = new Set(previousSummary.tags || [])
    const newTopics = currentTopics.filter(t => !previousTopics.has(t))
    const resolvedTopics = Array.from(previousTopics).filter(t => !currentTopics.includes(t))

    if (newTopics.length > 0) {
      changes.push(`New concerns: ${newTopics.join(', ')}`)
    }

    if (resolvedTopics.length > 0) {
      changes.push(`No longer mentioned: ${resolvedTopics.join(', ')}`)
    }

    return changes.length > 0 ? changes.join('. ') : 'No significant changes from previous check-in.'
  }

  /**
   * Full analysis pipeline
   */
  static analyze(
    messages: Message[],
    participantName: string,
    previousSummary: FeedbackSummary | null = null
  ): Omit<FeedbackSummary, 'id' | 'conversation_id' | 'message_range_start' | 'message_range_end' | 'previous_summary_id' | 'created_at'> {
    const topics = this.extractTopics(messages)
    const { sentiment, score } = this.analyzeSentiment(messages)
    const keyQuotes = this.extractKeyQuotes(messages)
    const actionItems = this.generateActionItems(messages, topics, sentiment)
    const summary = this.generateSummary(messages, topics, sentiment, participantName)
    const deltaNotes = this.compareSummaries(previousSummary, sentiment, topics)

    return {
      summary,
      sentiment,
      sentiment_score: score,
      tags: topics,
      action_items: actionItems,
      key_quotes: keyQuotes,
      delta_notes: deltaNotes,
      computed_at: new Date().toISOString(),
    }
  }
}
