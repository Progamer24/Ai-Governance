import { useState, useCallback } from 'react'
import { supabase } from '../config/supabase'
import type { AuditLogRecord } from '../types/audit.types'

interface AuditFilters {
  eventType?: string
  severity?: string
  startDate?: string
  endDate?: string
  actorId?: string
}

export function useAudit() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLogs = useCallback(async (filters?: AuditFilters) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (filters?.eventType) query = query.eq('event_type', filters.eventType)
      if (filters?.severity) query = query.eq('severity', filters.severity)
      if (filters?.actorId) query = query.eq('actor_id', filters.actorId)
      if (filters?.startDate) query = query.gte('created_at', filters.startDate)
      if (filters?.endDate) query = query.lte('created_at', filters.endDate)

      const { data, error } = await query
      if (error) throw error
      setLogs((data ?? []) as AuditLogRecord[])
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const subscribeToLogs = useCallback((onNew: (log: AuditLogRecord) => void) => {
    const channel = supabase
      .channel('realtime:audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          onNew(payload.new as AuditLogRecord)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refetch = useCallback(() => fetchLogs(), [fetchLogs])

  return { logs, isLoading, fetchLogs, subscribeToLogs, refetch }
}
