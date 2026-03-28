import { useState, useEffect, useCallback } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import SearchBar from '../../components/ui/SearchBar'
import LogTable from './LogTable'
import LogDetail from './LogDetail'
import ExportPanel from './ExportPanel'
import { supabase } from '../../config/supabase'
import type { AuditLogRecord, AuditSeverity } from '../../types/audit.types'

const SEVERITIES: AuditSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

interface RawLog {
  id: string
  event_type: string
  actor_id: string
  target_id: string | null
  target_type: string | null
  payload_encrypted: string
  severity: AuditSeverity
  created_at: string
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | ''>('')
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (severityFilter) query = query.eq('severity', severityFilter)

      const { data } = await query
      if (data) {
        setLogs(
          (data as RawLog[]).map((r) => ({
            id: r.id,
            eventType: r.event_type,
            actorId: r.actor_id,
            targetId: r.target_id,
            targetType: r.target_type,
            payloadEncrypted: r.payload_encrypted,
            severity: r.severity,
            createdAt: r.created_at,
          })),
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [severityFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const filtered = logs.filter((l) => {
    if (!search) return true
    const s = search.toLowerCase()
    return l.eventType.toLowerCase().includes(s) || l.actorId.toLowerCase().includes(s)
  })

  const handleRowClick = (log: AuditLogRecord) => {
    setSelectedLog(log)
    setShowDetail(true)
  }

  return (
    <PageWrapper title="Audit Logs">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Search event type or actor…"
              className="w-72"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity | '')}
              className="bg-white/5 border border-white/10 focus:border-cyan rounded-lg px-3 py-2 text-white text-sm outline-none font-mono"
            >
              <option value="">All Severities</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <ExportPanel logs={filtered} />
        </div>

        <LogTable logs={filtered} isLoading={isLoading} onRowClick={handleRowClick} />

        <LogDetail log={selectedLog} isOpen={showDetail} onClose={() => setShowDetail(false)} />
      </div>
    </PageWrapper>
  )
}
