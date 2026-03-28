import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import type { AuditLogRecord } from '../types/audit.types'

interface RawLog {
  id: string; event_type: string; actor_id: string; target_id: string | null
  target_type: string | null; payload_encrypted: string; severity: AuditLogRecord['severity']; created_at: string
}

export function useAudit() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) {
        setLogs((data as RawLog[]).map((r) => ({
          id: r.id, eventType: r.event_type, actorId: r.actor_id,
          targetId: r.target_id, targetType: r.target_type,
          payloadEncrypted: r.payload_encrypted, severity: r.severity, createdAt: r.created_at,
        })))
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])
  return { logs, isLoading, refetch: fetchLogs }
}
