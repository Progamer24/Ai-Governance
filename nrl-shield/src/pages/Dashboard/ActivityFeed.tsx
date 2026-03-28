import { Activity, AlertTriangle, Info, ShieldAlert, User } from 'lucide-react'
import Card from '../../components/ui/Card'
import type { AuditLogRecord, AuditSeverity } from '../../types/audit.types'

interface ActivityFeedProps {
  logs?: AuditLogRecord[]
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const severityColor: Record<AuditSeverity, string> = {
  LOW: 'text-white/60',
  MEDIUM: 'text-cyan',
  HIGH: 'text-amber',
  CRITICAL: 'text-crimson',
}

const severityDot: Record<AuditSeverity, string> = {
  LOW: 'bg-white/30',
  MEDIUM: 'bg-cyan',
  HIGH: 'bg-amber',
  CRITICAL: 'bg-crimson',
}

function EventIcon({ type }: { type: string }) {
  if (type.includes('AUTH') || type.includes('LOGIN')) return <User size={14} />
  if (type.includes('ALERT') || type.includes('RISK')) return <ShieldAlert size={14} />
  if (type.includes('ANOMALY') || type.includes('VIOLATION')) return <AlertTriangle size={14} />
  if (type.includes('QUERY') || type.includes('AI')) return <Activity size={14} />
  return <Info size={14} />
}

export default function ActivityFeed({ logs = [] }: ActivityFeedProps) {
  const recent = logs.slice(0, 10)

  return (
    <Card title="Activity Feed">
      {recent.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-white/40 text-sm">
          No recent activity
        </div>
      ) : (
        <ul className="space-y-3">
          {recent.map((log) => (
            <li key={log.id} className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${severityDot[log.severity]} bg-opacity-20`}>
                <span className={severityColor[log.severity]}>
                  <EventIcon type={log.eventType} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-mono truncate ${severityColor[log.severity]}`}>
                  {log.eventType}
                </p>
                <p className="text-xs text-white/30 mt-0.5 truncate">
                  {log.actorId} · {relativeTime(log.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
