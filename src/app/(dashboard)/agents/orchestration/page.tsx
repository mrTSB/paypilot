'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  Search,
  Shield,
  MessageCircle,
  BarChart3,
  Bot,
  Users,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Volume2,
  Activity,
  Database,
  FileJson,
  Layers,
  GitBranch,
  Timer,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

// =============================================================================
// RUN CONTEXT - Ties to real PayPilot entities
// =============================================================================
const RUN_CONTEXT = {
  agentInstance: {
    id: 'ai_001',
    name: 'Weekly Pulse Check',
    type: 'pulse_check',
  },
  audience: {
    type: 'department',
    name: 'Engineering',
    count: 8,
    employees: ['Sarah Chen', 'Alex Wong', 'Chris Martin', 'Mike Johnson', 'Jessica Brown', 'Ryan Lee', 'Emma Davis', 'Tom Wilson'],
  },
  mode: 'voice' as 'chat' | 'voice',
  voiceConfig: {
    lang: 'en-US',
    rate: 1.0,
    pitch: 1.0,
    style: 'friendly',
  },
  cadence: 'weekly',
  guardrails: ['no_sensitive_topics', 'no_medical_legal', 'no_coercion', 'escalate_distress'],
  lastRun: '2026-02-14T08:20:00Z',
  nextRun: '2026-02-21T08:00:00Z',
  conversationsCreated: 52,
}

// =============================================================================
// PIPELINE STAGES with detailed artifacts
// =============================================================================
const PIPELINE_STAGES = [
  {
    id: 'trigger',
    name: 'Trigger',
    icon: Zap,
    description: 'Run initiated',
    latency: 12,
    inputs: { source: 'scheduled', run_id: 'pp_7f3a8c2d', agent_id: 'ai_001', mode: 'VOICE' },
    outputs: { targets_loaded: 8, config_validated: true },
    artifacts: ['run_manifest.json'],
  },
  {
    id: 'planner',
    name: 'Planner',
    icon: Brain,
    description: 'Decomposing goals',
    latency: 289,
    inputs: { goal: 'pulse_check', audience: 'engineering', count: 8 },
    outputs: { subtasks: ['ask_status', 'detect_risk', 'produce_actions'], parallel_workers: 3 },
    artifacts: ['task_decomposition.json', 'worker_allocation.json'],
  },
  {
    id: 'retriever',
    name: 'Retriever',
    icon: Search,
    description: 'Loading context',
    latency: 411,
    inputs: { employee_ids: ['emp_001', 'emp_008', 'emp_010'], context_window: '7d' },
    outputs: { handbook_sections: 3, prior_messages: 24, calendar_events: 12 },
    artifacts: ['context_bundle.json', 'vector_embeddings.bin'],
  },
  {
    id: 'guardrails',
    name: 'Policy Guard',
    icon: Shield,
    description: 'Safety checks',
    latency: 198,
    inputs: { policies: ['no_sensitive', 'no_medical', 'escalation_rules'], draft_count: 8 },
    outputs: { passed: 7, blocked: 1, rewritten: 1 },
    artifacts: ['policy_report.json', 'blocked_phrases.json'],
  },
  {
    id: 'agent',
    name: 'Conversation Agent',
    icon: MessageCircle,
    description: 'Generating outreach',
    latency: 1842,
    inputs: { tone: 'poke-lite', voice_lang: 'en-US', personalization: true },
    outputs: { drafts_generated: 8, avg_tokens: 186, voice_audio_generated: true },
    artifacts: ['outreach_drafts.json', 'voice_audio/'],
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    icon: BarChart3,
    description: 'Extracting insights',
    latency: 523,
    inputs: { conversations: 8, extract: ['sentiment', 'action_items', 'risk_signals'] },
    outputs: { summaries: 8, action_items: 12, risk_flags: 2 },
    artifacts: ['feedback_summaries.json', 'action_items.json'],
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    icon: Sparkles,
    description: 'Persisting results',
    latency: 156,
    inputs: { conversations: 8, messages: 8, summaries: 8 },
    outputs: { db_writes: 24, notifications_sent: 8 },
    artifacts: ['dispatch_log.json'],
  },
]

// =============================================================================
// SUB-AGENTS with status tracking
// =============================================================================
const SUB_AGENTS = [
  { id: 'compliance', name: 'Compliance Checker', parent: 'guardrails' },
  { id: 'tone', name: 'Tone Refiner', parent: 'agent' },
  { id: 'sentiment', name: 'Sentiment Analyzer', parent: 'summarizer' },
  { id: 'actions', name: 'Action Extractor', parent: 'summarizer' },
  { id: 'safety', name: 'Safety Monitor', parent: 'guardrails' },
]

// =============================================================================
// REALISTIC TRACE LOGS
// =============================================================================
const generateRunId = () => `pp_${Math.random().toString(36).substring(2, 10)}`

const generateTraceLogs = (runId: string) => [
  // Trigger stage
  { ts: '08:20:14.113', level: 'INFO', agent: 'Orchestrator', msg: `run_id=${runId} agent=WeeklyPulseCheck mode=VOICE targets=8` },
  { ts: '08:20:14.125', level: 'INFO', agent: 'Orchestrator', msg: 'config_loaded: guardrails=[no_sensitive, no_medical, escalate_distress]' },

  // Planner stage
  { ts: '08:20:14.402', level: 'INFO', agent: 'Planner', msg: 'decomposed_goal -> { ask_status, detect_risk, produce_actions }' },
  { ts: '08:20:14.489', level: 'INFO', agent: 'Planner', msg: 'tool_call: supabase.query(company_members) -> 8 rows' },
  { ts: '08:20:14.567', level: 'INFO', agent: 'Planner', msg: 'spawning parallel_workers=3 for target_batch' },

  // Retriever stage
  { ts: '08:20:14.611', level: 'INFO', agent: 'Retriever', msg: 'tool_call: vector.search(policy_handbook) -> 3 sections' },
  { ts: '08:20:14.788', level: 'INFO', agent: 'Retriever', msg: 'tool_call: supabase.query(messages, last_7d) -> 24 messages' },
  { ts: '08:20:14.892', level: 'INFO', agent: 'Retriever', msg: 'tool_call: calendar.lookup(payroll_cycle) -> next_pay=Feb 20' },
  { ts: '08:20:14.956', level: 'INFO', agent: 'Retriever', msg: 'loaded_context: { handbook: 3, messages: 24, calendar: 12 }' },

  // Policy Guard stage
  { ts: '08:20:15.020', level: 'WARN', agent: 'PolicyGuard', msg: 'blocked_phrase="Are you feeling depressed?" reason=SensitiveTopic' },
  { ts: '08:20:15.089', level: 'INFO', agent: 'SafetyMonitor', msg: 'escalation_rules_loaded: distress_keywords=["overwhelmed","struggling","quit"]' },
  { ts: '08:20:15.134', level: 'INFO', agent: 'ComplianceChecker', msg: 'validated: no_pii_exposure, no_legal_advice' },
  { ts: '08:20:15.178', level: 'INFO', agent: 'PolicyGuard', msg: 'policy_check_complete: passed=7 blocked=1 rewritten=1' },

  // Conversation Agent stage
  { ts: '08:20:15.221', level: 'INFO', agent: 'ToneRefiner', msg: 'rewrote_prompt tone=poke-lite accent=en-US rate=1.0' },
  { ts: '08:20:15.445', level: 'INFO', agent: 'ConversationAgent', msg: 'generating draft 1/8 for Sarah Chen...' },
  { ts: '08:20:15.672', level: 'INFO', agent: 'ConversationAgent', msg: 'generating draft 2/8 for Alex Wong...' },
  { ts: '08:20:15.889', level: 'INFO', agent: 'ConversationAgent', msg: 'generating draft 3/8 for Chris Martin...' },
  { ts: '08:20:16.102', level: 'INFO', agent: 'ConversationAgent', msg: '[parallel] drafts 4-8 completed' },
  { ts: '08:20:16.331', level: 'INFO', agent: 'ConversationAgent', msg: 'voice_synthesis: generating audio for 8 messages...' },
  { ts: '08:20:16.903', level: 'INFO', agent: 'ConversationAgent', msg: 'drafted_outreach: count=8 avg_tokens=186 latency=1682ms' },

  // Summarizer stage
  { ts: '08:20:17.045', level: 'INFO', agent: 'SentimentAnalyzer', msg: 'tool_call: sentiment.score(messages) -> avg=0.72' },
  { ts: '08:20:17.234', level: 'INFO', agent: 'ActionExtractor', msg: 'extracted: ["Follow up on workload", "Schedule 1:1 with Mike"]' },
  { ts: '08:20:17.389', level: 'WARN', agent: 'SentimentAnalyzer', msg: 'risk_flag: employee=Chris Martin sentiment=0.34 -> moderate_risk' },
  { ts: '08:20:17.512', level: 'WARN', agent: 'SafetyMonitor', msg: 'escalation_candidate: Chris Martin (workload_stress)' },
  { ts: '08:20:17.590', level: 'INFO', agent: 'Summarizer', msg: 'wrote feedback_summaries count=8 action_items=12' },

  // Dispatcher stage
  { ts: '08:20:17.712', level: 'INFO', agent: 'Dispatcher', msg: 'tool_call: supabase.insert(conversations) -> 8 rows' },
  { ts: '08:20:17.823', level: 'INFO', agent: 'Dispatcher', msg: 'tool_call: supabase.insert(messages) -> 8 rows' },
  { ts: '08:20:17.901', level: 'INFO', agent: 'Dispatcher', msg: 'created_conversations=8 sent_messages=8 notifications=8' },
  { ts: '08:20:17.956', level: 'INFO', agent: 'Orchestrator', msg: `run_complete: ${runId} duration=3843ms status=SUCCESS` },
]

type StageStatus = 'pending' | 'running' | 'completed' | 'error'
type SubAgentStatus = 'queued' | 'running' | 'done'

interface TraceLog {
  ts: string
  level: string
  agent: string
  msg: string
}

export default function OrchestrationPage() {
  const { isAdmin, isLoading } = useUser()
  const router = useRouter()

  // Run state
  const [isRunning, setIsRunning] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>({})
  const [subAgentStatuses, setSubAgentStatuses] = useState<Record<string, SubAgentStatus>>({})
  const [traceLogs, setTraceLogs] = useState<TraceLog[]>([])
  const [totalDuration, setTotalDuration] = useState(0)

  // Inspector drawer
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<typeof PIPELINE_STAGES[0] | null>(null)

  // Complexity stats
  const [stats, setStats] = useState({
    parallelWorkers: 0,
    toolCalls: 0,
    policiesApplied: 0,
    escalations: 0,
  })

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error('Access denied', { description: 'Admin access required' })
      router.replace('/messages')
    }
  }, [isAdmin, isLoading, router])

  const resetRun = useCallback(() => {
    setCurrentStageIndex(-1)
    setStageStatuses({})
    setSubAgentStatuses({})
    setTraceLogs([])
    setRunId(null)
    setTotalDuration(0)
    setStats({ parallelWorkers: 0, toolCalls: 0, policiesApplied: 0, escalations: 0 })
  }, [])

  const startRun = useCallback(async () => {
    if (isRunning) return
    resetRun()
    setIsRunning(true)

    const newRunId = generateRunId()
    setRunId(newRunId)
    const allLogs = generateTraceLogs(newRunId)
    let logIndex = 0
    let duration = 0

    // Process each stage
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      const stage = PIPELINE_STAGES[i]
      setCurrentStageIndex(i)
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'running' }))

      // Add logs for this stage with timing
      const stageLogs = allLogs.filter(log => {
        const agentLower = log.agent.toLowerCase()
        if (stage.id === 'trigger' && agentLower === 'orchestrator' && logIndex < 2) return true
        if (stage.id === 'planner' && (agentLower === 'planner') && logIndex >= 2 && logIndex < 5) return true
        if (stage.id === 'retriever' && agentLower === 'retriever' && logIndex >= 5 && logIndex < 9) return true
        if (stage.id === 'guardrails' && ['policyguard', 'safetymonitor', 'compliancechecker'].includes(agentLower) && logIndex >= 9 && logIndex < 13) return true
        if (stage.id === 'agent' && ['tonerefiner', 'conversationagent'].includes(agentLower) && logIndex >= 13 && logIndex < 20) return true
        if (stage.id === 'summarizer' && ['sentimentanalyzer', 'actionextractor', 'safetymonitor', 'summarizer'].includes(agentLower) && logIndex >= 20 && logIndex < 26) return true
        if (stage.id === 'dispatcher' && ['dispatcher', 'orchestrator'].includes(agentLower) && logIndex >= 26) return true
        return false
      })

      for (let j = 0; j < stageLogs.length && logIndex < allLogs.length; j++) {
        await new Promise(r => setTimeout(r, 80 + Math.random() * 120))
        setTraceLogs(prev => [...prev, allLogs[logIndex]])

        // Update stats based on log content
        const log = allLogs[logIndex]
        if (log.msg.includes('tool_call')) {
          setStats(s => ({ ...s, toolCalls: s.toolCalls + 1 }))
        }
        if (log.msg.includes('parallel_workers')) {
          setStats(s => ({ ...s, parallelWorkers: 3 }))
        }
        if (log.msg.includes('policy') || log.msg.includes('validated')) {
          setStats(s => ({ ...s, policiesApplied: s.policiesApplied + 1 }))
        }
        if (log.msg.includes('escalation') || log.msg.includes('risk_flag')) {
          setStats(s => ({ ...s, escalations: s.escalations + 1 }))
        }

        // Trigger sub-agent animations
        if (log.agent === 'ComplianceChecker') {
          setSubAgentStatuses(prev => ({ ...prev, compliance: 'running' }))
          setTimeout(() => setSubAgentStatuses(prev => ({ ...prev, compliance: 'done' })), 400)
        }
        if (log.agent === 'SafetyMonitor') {
          setSubAgentStatuses(prev => ({ ...prev, safety: 'running' }))
          setTimeout(() => setSubAgentStatuses(prev => ({ ...prev, safety: 'done' })), 400)
        }
        if (log.agent === 'ToneRefiner') {
          setSubAgentStatuses(prev => ({ ...prev, tone: 'running' }))
          setTimeout(() => setSubAgentStatuses(prev => ({ ...prev, tone: 'done' })), 600)
        }
        if (log.agent === 'SentimentAnalyzer') {
          setSubAgentStatuses(prev => ({ ...prev, sentiment: 'running' }))
          setTimeout(() => setSubAgentStatuses(prev => ({ ...prev, sentiment: 'done' })), 500)
        }
        if (log.agent === 'ActionExtractor') {
          setSubAgentStatuses(prev => ({ ...prev, actions: 'running' }))
          setTimeout(() => setSubAgentStatuses(prev => ({ ...prev, actions: 'done' })), 400)
        }

        logIndex++
      }

      duration += stage.latency
      setTotalDuration(duration)
      await new Promise(r => setTimeout(r, 150))
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'completed' }))
    }

    setIsRunning(false)
    toast.success('Orchestration complete!', {
      description: '8 employees contacted. 2 flagged as moderate risk.',
      action: {
        label: 'View Conversations',
        onClick: () => router.push('/messages'),
      },
    })
  }, [isRunning, resetRun, router])

  const openInspector = (stage: typeof PIPELINE_STAGES[0]) => {
    setSelectedStage(stage)
    setInspectorOpen(true)
  }

  const getStageStatus = (stageId: string): StageStatus => stageStatuses[stageId] || 'pending'
  const getSubAgentStatus = (agentId: string): SubAgentStatus => subAgentStatuses[agentId] || 'queued'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Agent Orchestration
          </h1>
          <p className="text-muted-foreground text-sm">
            Multi-agent pipeline execution for PayPilot workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetRun} disabled={isRunning}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button onClick={startRun} disabled={isRunning} size="sm" className="bg-primary hover:bg-primary/90">
            {isRunning ? (
              <>
                <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run Orchestration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Run Context Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Agent Instance</p>
              <p className="font-medium flex items-center gap-1">
                <Bot className="w-3 h-3 text-primary" />
                {RUN_CONTEXT.agentInstance.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Audience</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                {RUN_CONTEXT.audience.name} ({RUN_CONTEXT.audience.count})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Mode</p>
              <Badge variant="outline" className={cn(
                "text-xs",
                RUN_CONTEXT.mode === 'voice' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {RUN_CONTEXT.mode === 'voice' && <Volume2 className="w-3 h-3 mr-1" />}
                {RUN_CONTEXT.mode === 'chat' && <MessageCircle className="w-3 h-3 mr-1" />}
                {RUN_CONTEXT.mode.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cadence</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                {RUN_CONTEXT.cadence}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Last Run</p>
              <p className="font-medium text-xs">
                {new Date(RUN_CONTEXT.lastRun).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Conversations</p>
              <Link href="/messages" className="font-medium text-primary hover:underline flex items-center gap-1">
                {RUN_CONTEXT.conversationsCreated} created
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-2">Guardrails:</span>
            {RUN_CONTEXT.guardrails.map(g => (
              <Badge key={g} variant="secondary" className="text-xs py-0">
                <Shield className="w-2.5 h-2.5 mr-1" />
                {g.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pipeline + Sub-agents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Complexity Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-lg font-bold">{stats.parallelWorkers || '-'}</p>
                  <p className="text-xs text-muted-foreground">Parallel Workers</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-lg font-bold">{stats.toolCalls || '-'}</p>
                  <p className="text-xs text-muted-foreground">Tool Calls</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-lg font-bold">{stats.policiesApplied || '-'}</p>
                  <p className="text-xs text-muted-foreground">Policies Applied</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-lg font-bold">{stats.escalations || '-'}</p>
                  <p className="text-xs text-muted-foreground">Risk Flags</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pipeline Stages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Execution Pipeline</span>
                {totalDuration > 0 && (
                  <Badge variant="outline" className="font-mono text-xs">
                    <Timer className="w-3 h-3 mr-1" />
                    {(totalDuration / 1000).toFixed(2)}s
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_STAGES.map((stage, index) => {
                  const status = getStageStatus(stage.id)
                  const Icon = stage.icon

                  return (
                    <motion.button
                      key={stage.id}
                      onClick={() => status === 'completed' && openInspector(stage)}
                      className={cn(
                        "relative flex-1 min-w-[100px] p-3 rounded-lg border-2 transition-all text-left",
                        status === 'pending' && "border-gray-200 bg-gray-50 cursor-default",
                        status === 'running' && "border-primary bg-primary/5 shadow-lg shadow-primary/20",
                        status === 'completed' && "border-green-500 bg-green-50 cursor-pointer hover:bg-green-100",
                        status === 'error' && "border-red-500 bg-red-50"
                      )}
                      animate={status === 'running' ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-6 h-6 rounded flex items-center justify-center",
                          status === 'pending' && "bg-gray-200 text-gray-500",
                          status === 'running' && "bg-primary text-white",
                          status === 'completed' && "bg-green-500 text-white",
                        )}>
                          {status === 'running' ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="text-xs font-medium">{stage.name}</span>
                      </div>
                      {status === 'completed' && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{stage.description}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            {stage.latency}ms
                          </Badge>
                        </div>
                      )}
                      {status === 'completed' && (
                        <ChevronRight className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-green-500"
                  initial={{ width: '0%' }}
                  animate={{
                    width: currentStageIndex >= 0
                      ? `${((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100}%`
                      : '0%'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sub-agents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                Spawned Sub-Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {SUB_AGENTS.map((agent) => {
                  const status = getSubAgentStatus(agent.id)

                  return (
                    <motion.div
                      key={agent.id}
                      className={cn(
                        "p-2 rounded-lg border text-center transition-all",
                        status === 'queued' && "border-gray-200 bg-gray-50",
                        status === 'running' && "border-primary bg-primary/5",
                        status === 'done' && "border-green-500 bg-green-50"
                      )}
                      animate={status === 'running' ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] mb-1",
                          status === 'queued' && "bg-gray-100 text-gray-500",
                          status === 'running' && "bg-primary/10 text-primary border-primary",
                          status === 'done' && "bg-green-100 text-green-700 border-green-300"
                        )}
                      >
                        {status === 'queued' && <Clock className="w-2.5 h-2.5 mr-0.5" />}
                        {status === 'running' && <Activity className="w-2.5 h-2.5 mr-0.5 animate-pulse" />}
                        {status === 'done' && <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />}
                        {status}
                      </Badge>
                      <p className="text-xs font-medium truncate">{agent.name}</p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* View Conversations CTA */}
          {!isRunning && currentStageIndex === PIPELINE_STAGES.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-green-300 bg-green-50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Run Complete!</p>
                      <p className="text-sm text-green-700">
                        8 conversations created, 2 flagged as moderate risk
                      </p>
                    </div>
                  </div>
                  <Link href="/messages">
                    <Button className="bg-green-600 hover:bg-green-700">
                      View Conversations
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Trace Log */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Trace Log
              </span>
              {runId && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {runId}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {traceLogs.length > 0 ? `${traceLogs.length} events` : 'Waiting for run...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-3 space-y-1 font-mono text-[11px]">
                <AnimatePresence>
                  {traceLogs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Click &quot;Run Orchestration&quot;</p>
                    </div>
                  )}
                  {traceLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "py-1 px-2 rounded",
                        log.level === 'WARN' && "bg-amber-50 text-amber-800",
                        log.level === 'INFO' && "bg-gray-50 text-gray-700",
                        log.level === 'ERROR' && "bg-red-50 text-red-800"
                      )}
                    >
                      <span className="text-muted-foreground">[{log.ts}]</span>
                      <span className={cn(
                        "ml-1 font-semibold",
                        log.level === 'WARN' && "text-amber-600",
                        log.level === 'INFO' && "text-blue-600",
                        log.level === 'ERROR' && "text-red-600"
                      )}>
                        {log.level}
                      </span>
                      <span className="ml-1 text-primary font-medium">{log.agent}:</span>
                      <span className="ml-1 break-all">{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Inspector Drawer */}
      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedStage && <selectedStage.icon className="w-5 h-5 text-primary" />}
              {selectedStage?.name} Inspector
            </SheetTitle>
          </SheetHeader>
          {selectedStage && (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileJson className="w-4 h-4" /> Inputs
                </h4>
                <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(selectedStage.inputs, null, 2)}
                </pre>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileJson className="w-4 h-4" /> Outputs
                </h4>
                <pre className="bg-green-50 p-3 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(selectedStage.outputs, null, 2)}
                </pre>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Latency</h4>
                  <Badge variant="outline" className="font-mono">
                    <Timer className="w-3 h-3 mr-1" />
                    {selectedStage.latency}ms
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Confidence</h4>
                  <Badge variant="outline" className="font-mono bg-green-50 text-green-700">
                    {(0.92 + Math.random() * 0.07).toFixed(2)}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Artifacts Produced</h4>
                <div className="space-y-1">
                  {selectedStage.artifacts.map((artifact, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileJson className="w-3 h-3" />
                      {artifact}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
