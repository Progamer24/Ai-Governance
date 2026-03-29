import { useMemo, useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

interface Agent {
  id: string
  name: string
  provider: string
  status: 'ONLINE' | 'OFFLINE'
}

const STORAGE_KEY = 'nrl.admin.aiAgents'

function readAgents(): Agent[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Agent[]
  } catch {
    return []
  }
}

function saveAgents(agents: Agent[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
}

export default function AISettings() {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const existing = readAgents()
    return existing.length > 0
      ? existing
      : [{ id: 'agent-default', name: 'Primary Assistant', provider: 'supabase-edge', status: 'ONLINE' }]
  })
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('openai')

  const online = useMemo(() => agents.filter((a) => a.status === 'ONLINE').length, [agents])

  const addAgent = () => {
    if (!name.trim()) return
    const next: Agent[] = [{ id: crypto.randomUUID(), name: name.trim(), provider, status: 'ONLINE' }, ...agents]
    setAgents(next)
    saveAgents(next)
    setName('')
  }

  const toggle = (id: string) => {
    const next: Agent[] = agents.map((a) => (a.id === id ? { ...a, status: a.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' } : a))
    setAgents(next)
    saveAgents(next)
  }

  return (
    <Card title="AI Agents">
      <div className="mb-3 text-xs text-white/50">Online agents: {online}/{agents.length}</div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
          <option value="openai">OpenAI</option>
          <option value="huggingface">HuggingFace</option>
          <option value="local-llm">Local LLM</option>
          <option value="supabase-edge">Supabase Edge</option>
        </select>
        <Button variant="primary" onClick={addAgent}>Add AI Agent</Button>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
            <div>
              <p className="text-sm text-white">{agent.name}</p>
              <p className="text-xs text-white/50">Provider: {agent.provider}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={agent.status === 'ONLINE' ? 'success' : 'warning'}>{agent.status}</Badge>
              <Button variant="secondary" size="sm" onClick={() => toggle(agent.id)}>
                {agent.status === 'ONLINE' ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
