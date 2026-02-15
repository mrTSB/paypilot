import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/insights - Get insights dashboard data
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin permissions
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    if (!['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '7', 10)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get recent summaries with participant info
    const { data: summaries, error: summaryError } = await supabase
      .from('feedback_summaries')
      .select(`
        *,
        conversations (
          id,
          participant_user_id,
          agent_instance_id,
          profiles!conversations_participant_user_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          agent_instances (
            name
          )
        )
      `)
      .gte('computed_at', since)
      .order('computed_at', { ascending: false })
      .limit(50)

    if (summaryError) {
      console.error('Error fetching summaries:', summaryError)
    }

    // Calculate sentiment distribution
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 }
    const tagCounts: Record<string, number> = {}
    const allActionItems: Array<{
      text: string
      confidence: number
      priority: string
      conversation_id: string
      participant_name: string
    }> = []

    for (const summary of summaries || []) {
      // Count sentiment
      if (summary.sentiment in sentimentCounts) {
        sentimentCounts[summary.sentiment as keyof typeof sentimentCounts]++
      }

      // Count tags
      const tags = summary.tags as string[] || []
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }

      // Collect action items
      const actions = summary.action_items as Array<{
        text: string
        confidence: number
        priority: string
      }> || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conv = summary.conversations as any
      const participantName = conv?.profiles?.full_name || 'Employee'

      for (const action of actions) {
        allActionItems.push({
          ...action,
          conversation_id: summary.conversation_id,
          participant_name: participantName,
        })
      }
    }

    // Sort tags by count
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get open escalations
    const { data: escalations } = await supabase
      .from('agent_escalations')
      .select(`
        *,
        conversations (
          profiles!conversations_participant_user_id_fkey (
            full_name
          )
        )
      `)
      .eq('company_id', membership.company_id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    // Calculate delta highlights (comparing this week to last week)
    const lastWeekSince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: lastWeekSummaries } = await supabase
      .from('feedback_summaries')
      .select('sentiment, tags')
      .gte('computed_at', lastWeekSince)
      .lt('computed_at', since)

    let deltaHighlights = {
      improved: [] as string[],
      declined: [] as string[],
      new_concerns: [] as string[],
    }

    if (lastWeekSummaries && lastWeekSummaries.length > 0) {
      const lastWeekNegativeRate = lastWeekSummaries.filter(s => s.sentiment === 'negative').length / lastWeekSummaries.length
      const thisWeekNegativeRate = sentimentCounts.negative / Math.max((summaries || []).length, 1)

      if (thisWeekNegativeRate < lastWeekNegativeRate - 0.1) {
        deltaHighlights.improved.push('Overall sentiment has improved')
      } else if (thisWeekNegativeRate > lastWeekNegativeRate + 0.1) {
        deltaHighlights.declined.push('More negative feedback this week')
      }

      // Find new tags that weren't present last week
      const lastWeekTags = new Set(lastWeekSummaries.flatMap(s => s.tags as string[] || []))
      const newTags = Object.keys(tagCounts).filter(t => !lastWeekTags.has(t))
      if (newTags.length > 0) {
        deltaHighlights.new_concerns.push(`New topics: ${newTags.join(', ')}`)
      }
    }

    // Format recent summaries for feed
    const recentFeed = (summaries || []).map(summary => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conv = summary.conversations as any
      return {
        id: summary.id,
        conversation_id: summary.conversation_id,
        summary: summary.summary,
        sentiment: summary.sentiment,
        tags: summary.tags,
        computed_at: summary.computed_at,
        participant: {
          name: conv?.profiles?.full_name || 'Employee',
          avatar_url: conv?.profiles?.avatar_url,
        },
        agent_name: conv?.agent_instances?.name || 'Agent',
        key_quotes: summary.key_quotes,
        delta_notes: summary.delta_notes,
      }
    })

    // Get conversation stats
    const { count: activeConversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', membership.company_id)
      .eq('status', 'active')

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)

    return NextResponse.json({
      feed: recentFeed,
      sentiment_distribution: sentimentCounts,
      top_tags: topTags,
      action_items: allActionItems.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
      }).slice(0, 20),
      escalations: (escalations || []).map(e => ({
        ...e,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        participant_name: (e.conversations as any)?.profiles?.full_name || 'Employee',
      })),
      delta_highlights: deltaHighlights,
      stats: {
        active_conversations: activeConversations || 0,
        messages_this_period: totalMessages || 0,
        summaries_count: (summaries || []).length,
        open_escalations: (escalations || []).length,
      },
      period: {
        days,
        since,
      },
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
