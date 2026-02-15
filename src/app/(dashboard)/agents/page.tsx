'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  MessageCircle,
  Users,
  Calendar,
  MoreVertical,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Agent {
  id: string
  name: string
  slug: string
  description: string
  agent_type: string
}

interface AgentInstance {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  config: {
    tone_preset: string
    audience_type: string
  }
  created_at: string
  agents: Agent
  agent_schedules: Array<{
    cadence: string
    next_run_at: string
  }>
  stats?: {
    conversations: number
    messages: number
  }
}

interface TonePreset {
  id: string
  slug: string
  name: string
  description: string
}

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  pulse_check: <TrendingUp className="h-5 w-5" />,
  onboarding: <Users className="h-5 w-5" />,
  exit_interview: <MessageCircle className="h-5 w-5" />,
  manager_coaching: <Zap className="h-5 w-5" />,
}

const AGENT_TYPE_COLORS: Record<string, string> = {
  pulse_check: 'bg-green-500/10 text-green-500',
  onboarding: 'bg-blue-500/10 text-blue-500',
  exit_interview: 'bg-orange-500/10 text-orange-500',
  manager_coaching: 'bg-purple-500/10 text-purple-500',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  draft: 'bg-gray-500',
  archived: 'bg-red-500',
}

export default function AgentsPage() {
  const [instances, setInstances] = useState<AgentInstance[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [tonePresets, setTonePresets] = useState<TonePreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [tonePreset, setTonePreset] = useState('poke_lite')
  const [audienceType, setAudienceType] = useState('company_wide')
  const [cadence, setCadence] = useState('weekly')
  const [guardrails, setGuardrails] = useState({
    no_sensitive_topics: true,
    no_medical_legal: true,
    no_coercion: true,
    no_harassment: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [instancesRes, agentsRes] = await Promise.all([
        fetch('/api/agents/instances'),
        fetch('/api/agents'),
      ])

      if (instancesRes.ok) {
        const data = await instancesRes.json()
        setInstances(data.instances || [])
      }

      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setAgents(data.agents || [])
        setTonePresets(data.tonePresets || [])
        if (data.agents?.length > 0) {
          setSelectedAgentId(data.agents[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load agents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedAgentId || !instanceName) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/agents/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgentId,
          name: instanceName,
          config: {
            tone_preset: tonePreset,
            audience_type: audienceType,
            guardrails,
          },
          schedule: {
            cadence,
          },
        }),
      })

      if (res.ok) {
        toast.success('Agent created successfully!')
        setIsCreateOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create agent')
      }
    } catch (error) {
      console.error('Failed to create agent:', error)
      toast.error('Failed to create agent')
    } finally {
      setIsCreating(false)
    }
  }

  const handleTrigger = async (instanceId: string) => {
    try {
      const res = await fetch(`/api/agents/instances/${instanceId}/trigger`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Sent ${data.messages_sent} messages to ${data.conversations_touched} employees`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to trigger agent')
      }
    } catch (error) {
      console.error('Failed to trigger agent:', error)
      toast.error('Failed to trigger agent')
    }
  }

  const handleStatusChange = async (instanceId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/agents/instances/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'paused'}`)
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update agent')
      }
    } catch (error) {
      console.error('Failed to update agent:', error)
      toast.error('Failed to update agent')
    }
  }

  const resetForm = () => {
    setInstanceName('')
    setTonePreset('poke_lite')
    setAudienceType('company_wide')
    setCadence('weekly')
    setGuardrails({
      no_sensitive_topics: true,
      no_medical_legal: true,
      no_coercion: true,
      no_harassment: true,
    })
    if (agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
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
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="text-muted-foreground">
            Create and manage automated employee engagement agents
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.filter(i => i.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {instances.reduce((acc, i) => acc + (i.stats?.conversations || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {instances.reduce((acc, i) => acc + (i.stats?.messages || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Instances Grid */}
      {instances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI agent to start collecting employee feedback
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance, index) => (
            <motion.div
              key={instance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${AGENT_TYPE_COLORS[instance.agents?.agent_type] || 'bg-gray-500/10 text-gray-500'}`}>
                        {AGENT_TYPE_ICONS[instance.agents?.agent_type] || <Bot className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{instance.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {instance.agents?.agent_type?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTrigger(instance.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Trigger Now
                        </DropdownMenuItem>
                        {instance.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(instance.id, 'paused')}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(instance.id, 'active')}>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[instance.status]}`} />
                    <span className="text-sm capitalize">{instance.status}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {instance.config?.tone_preset?.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Audience</p>
                      <p className="font-medium capitalize">
                        {instance.config?.audience_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cadence</p>
                      <p className="font-medium capitalize">
                        {instance.agent_schedules?.[0]?.cadence || 'Not set'}
                      </p>
                    </div>
                  </div>

                  {instance.agent_schedules?.[0]?.next_run_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Next run: {formatDate(instance.agent_schedules[0].next_run_at)}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{instance.stats?.conversations || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{instance.stats?.messages || 0}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrigger(instance.id)}
                      disabled={instance.status !== 'active'}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create AI Agent</DialogTitle>
            <DialogDescription>
              Set up an automated agent to engage with employees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Agent Type */}
            <div className="space-y-2">
              <Label>Agent Type</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        {AGENT_TYPE_ICONS[agent.agent_type]}
                        <span>{agent.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAgentId && (
                <p className="text-sm text-muted-foreground">
                  {agents.find(a => a.id === selectedAgentId)?.description}
                </p>
              )}
            </div>

            {/* Instance Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Weekly Team Pulse"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </div>

            {/* Tone Preset */}
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tonePreset} onValueChange={setTonePreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tonePresets.map((preset) => (
                    <SelectItem key={preset.slug} value={preset.slug}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audienceType} onValueChange={setAudienceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_wide">Company-wide</SelectItem>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="team">By Team</SelectItem>
                  <SelectItem value="individual">Individual Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cadence */}
            <div className="space-y-2">
              <Label>Cadence</Label>
              <Select value={cadence} onValueChange={setCadence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Guardrails */}
            <div className="space-y-2">
              <Label>Safety Guardrails</Label>
              <div className="space-y-2">
                {Object.entries(guardrails).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setGuardrails({ ...guardrails, [key]: checked })
                      }
                    />
                    <label htmlFor={key} className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
