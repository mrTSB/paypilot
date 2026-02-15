'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  Search,
  Shield,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Bot,
  Users,
  Sparkles,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Pipeline stages with their metadata
const PIPELINE_STAGES = [
  { id: 'trigger', name: 'Trigger', icon: Zap, description: 'Run initiated' },
  { id: 'planner', name: 'Planner', icon: Brain, description: 'Analyzing targets' },
  { id: 'retriever', name: 'Retriever', icon: Search, description: 'Loading context' },
  { id: 'guardrails', name: 'Policy Guard', icon: Shield, description: 'Safety checks' },
  { id: 'agent', name: 'Conversation Agent', icon: MessageCircle, description: 'Generating outreach' },
  { id: 'summarizer', name: 'Summarizer', icon: BarChart3, description: 'Extracting insights' },
  { id: 'insights', name: 'Insights', icon: Sparkles, description: 'Updating dashboard' },
]

// Sub-agents that get spawned
const SUB_AGENTS = [
  { id: 'compliance', name: 'Compliance Checker', description: 'Validates HR policy adherence' },
  { id: 'tone', name: 'Tone Refiner', description: 'Adjusts message tone to preset' },
  { id: 'sentiment', name: 'Sentiment Analyzer', description: 'Classifies employee mood' },
  { id: 'actions', name: 'Action Extractor', description: 'Identifies follow-up items' },
  { id: 'safety', name: 'Safety Monitor', description: 'Detects escalation signals' },
]

// Log messages that appear during the run
const RUN_LOGS = [
  { stage: 'trigger', message: 'Run initiated by HR Admin', type: 'info' },
  { stage: 'trigger', message: 'Agent: Weekly Pulse Check', type: 'info' },
  { stage: 'planner', message: 'Loaded 8 target employees', type: 'success' },
  { stage: 'planner', message: 'Filtering by audience: Engineering team', type: 'info' },
  { stage: 'retriever', message: 'Retrieved employee profiles', type: 'success' },
  { stage: 'retriever', message: 'Loaded conversation history (3 prior threads)', type: 'info' },
  { stage: 'guardrails', message: 'Policy check passed: No sensitive data requests', type: 'success' },
  { stage: 'guardrails', message: 'Tone preset validated: friendly_peer', type: 'success' },
  { stage: 'agent', message: 'Spawning sub-agent: Compliance Checker', type: 'info' },
  { stage: 'agent', message: 'Spawning sub-agent: Tone Refiner', type: 'info' },
  { stage: 'agent', message: 'Generated 8 personalized outreach messages', type: 'success' },
  { stage: 'agent', message: 'Persisted 8 new conversations', type: 'success' },
  { stage: 'summarizer', message: 'Spawning sub-agent: Sentiment Analyzer', type: 'info' },
  { stage: 'summarizer', message: 'Spawning sub-agent: Action Extractor', type: 'info' },
  { stage: 'summarizer', message: 'Analyzed 8 conversations', type: 'success' },
  { stage: 'insights', message: 'Updated feedback_summaries (8 new)', type: 'success' },
  { stage: 'insights', message: 'Run completed successfully in 2.4s', type: 'success' },
]

type StageStatus = 'pending' | 'running' | 'completed' | 'error'
type SubAgentStatus = 'queued' | 'running' | 'done'

export default function OrchestrationPage() {
  const { isAdmin, isLoading } = useUser()
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [currentStage, setCurrentStage] = useState(-1)
  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>({})
  const [subAgentStatuses, setSubAgentStatuses] = useState<Record<string, SubAgentStatus>>({})
  const [logs, setLogs] = useState<typeof RUN_LOGS>([])
  const [runCount, setRunCount] = useState(0)

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error('Access denied', { description: 'Admin access required' })
      router.replace('/messages')
    }
  }, [isAdmin, isLoading, router])

  const resetRun = () => {
    setCurrentStage(-1)
    setStageStatuses({})
    setSubAgentStatuses({})
    setLogs([])
  }

  const startRun = async () => {
    if (isRunning) return
    resetRun()
    setIsRunning(true)
    setRunCount(prev => prev + 1)

    // Animate through each stage
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      const stage = PIPELINE_STAGES[i]
      setCurrentStage(i)
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'running' }))

      // Add logs for this stage
      const stageLogs = RUN_LOGS.filter(log => log.stage === stage.id)
      for (const log of stageLogs) {
        await new Promise(r => setTimeout(r, 200))
        setLogs(prev => [...prev, log])

        // Trigger sub-agent animations
        if (log.message.includes('Spawning sub-agent:')) {
          const subAgentName = log.message.split(': ')[1]
          const subAgent = SUB_AGENTS.find(s => s.name === subAgentName)
          if (subAgent) {
            setSubAgentStatuses(prev => ({ ...prev, [subAgent.id]: 'running' }))
            setTimeout(() => {
              setSubAgentStatuses(prev => ({ ...prev, [subAgent.id]: 'done' }))
            }, 800)
          }
        }
      }

      // Wait for stage to complete
      await new Promise(r => setTimeout(r, 400))
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'completed' }))
    }

    setIsRunning(false)
    toast.success('Orchestration run completed!', {
      description: '8 employees contacted, insights updated'
    })
  }

  const getStageStatus = (stageId: string): StageStatus => {
    return stageStatuses[stageId] || 'pending'
  }

  const getSubAgentStatus = (agentId: string): SubAgentStatus => {
    return subAgentStatuses[agentId] || 'queued'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Agent Orchestration
          </h1>
          <p className="text-muted-foreground">
            Visualize how PayPilot coordinates AI agents to handle employee outreach
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetRun}
            disabled={isRunning}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={startRun}
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Orchestration
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Execution Pipeline</CardTitle>
              <CardDescription>Multi-stage agent workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Pipeline stages */}
                <div className="flex flex-wrap justify-between gap-4">
                  {PIPELINE_STAGES.map((stage, index) => {
                    const status = getStageStatus(stage.id)
                    const Icon = stage.icon

                    return (
                      <div key={stage.id} className="flex items-center">
                        <motion.div
                          className={cn(
                            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[100px]",
                            status === 'pending' && "border-gray-200 bg-gray-50",
                            status === 'running' && "border-primary bg-primary/5 shadow-lg shadow-primary/20",
                            status === 'completed' && "border-green-500 bg-green-50",
                            status === 'error' && "border-red-500 bg-red-50"
                          )}
                          animate={status === 'running' ? {
                            scale: [1, 1.05, 1],
                            transition: { repeat: Infinity, duration: 0.8 }
                          } : {}}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                            status === 'pending' && "bg-gray-200 text-gray-500",
                            status === 'running' && "bg-primary text-white",
                            status === 'completed' && "bg-green-500 text-white",
                            status === 'error' && "bg-red-500 text-white"
                          )}>
                            {status === 'running' ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-center">{stage.name}</span>
                          <span className="text-xs text-muted-foreground text-center">{stage.description}</span>
                        </motion.div>

                        {/* Arrow between stages */}
                        {index < PIPELINE_STAGES.length - 1 && (
                          <motion.div
                            className="hidden md:flex items-center px-2"
                            initial={{ opacity: 0.3 }}
                            animate={{
                              opacity: status === 'completed' ? 1 : 0.3,
                              scale: currentStage === index ? [1, 1.2, 1] : 1
                            }}
                          >
                            <ArrowRight className={cn(
                              "w-5 h-5",
                              status === 'completed' ? "text-green-500" : "text-gray-300"
                            )} />
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-green-500"
                    initial={{ width: '0%' }}
                    animate={{
                      width: currentStage >= 0
                        ? `${((currentStage + 1) / PIPELINE_STAGES.length) * 100}%`
                        : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sub-agents Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Spawned Sub-Agents
              </CardTitle>
              <CardDescription>Specialized workers invoked during execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SUB_AGENTS.map((agent) => {
                  const status = getSubAgentStatus(agent.id)

                  return (
                    <motion.div
                      key={agent.id}
                      className={cn(
                        "p-3 rounded-lg border-2 text-center transition-all",
                        status === 'queued' && "border-gray-200 bg-gray-50",
                        status === 'running' && "border-primary bg-primary/5",
                        status === 'done' && "border-green-500 bg-green-50"
                      )}
                      animate={status === 'running' ? {
                        scale: [1, 1.03, 1],
                        transition: { repeat: Infinity, duration: 0.5 }
                      } : {}}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            status === 'queued' && "bg-gray-100 text-gray-500",
                            status === 'running' && "bg-primary/10 text-primary border-primary",
                            status === 'done' && "bg-green-100 text-green-700 border-green-300"
                          )}
                        >
                          {status === 'queued' && <Clock className="w-3 h-3 mr-1" />}
                          {status === 'running' && <div className="w-3 h-3 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                          {status === 'done' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Run Log */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Run Log
              </CardTitle>
              <CardDescription>
                {logs.length > 0 ? `${logs.length} events logged` : 'Waiting for run...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  <AnimatePresence>
                    {logs.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Click &quot;Run Orchestration&quot; to see the pipeline in action</p>
                      </div>
                    )}
                    {logs.map((log, index) => (
                      <motion.div
                        key={`${runCount}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "p-2 rounded-lg text-sm flex items-start gap-2",
                          log.type === 'success' && "bg-green-50 text-green-800",
                          log.type === 'info' && "bg-accent text-foreground",
                          log.type === 'error' && "bg-red-50 text-red-800",
                          log.type === 'warning' && "bg-yellow-50 text-yellow-800"
                        )}
                      >
                        {log.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {log.type === 'info' && <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />}
                        {log.type === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {log.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <span>{log.message}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats after run */}
      {currentStage === PIPELINE_STAGES.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">8</p>
                  <p className="text-sm text-green-600">Employees Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">8</p>
                  <p className="text-sm text-green-600">Conversations Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">5</p>
                  <p className="text-sm text-green-600">Sub-Agents Spawned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">2.4s</p>
                  <p className="text-sm text-green-600">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
