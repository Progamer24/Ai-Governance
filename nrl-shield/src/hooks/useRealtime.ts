import { useEffect, useRef, useState } from 'react'
import { supabase } from '../config/supabase'

export function useRealtime<T extends Record<string, unknown>>(
  table: string,
  callback?: (record: T) => void
): { records: T[]; newRecord: T | null; isSubscribed: boolean } {
  const [records, setRecords] = useState<T[]>([])
  const [newRecord, setNewRecord] = useState<T | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          const record = (payload.new ?? payload.old) as T
          if (payload.eventType === 'INSERT') {
            setRecords((prev) => [...prev, record])
            setNewRecord(record)
          } else if (payload.eventType === 'UPDATE') {
            setRecords((prev) =>
              prev.map((r) => ((r as Record<string, unknown>).id === (record as Record<string, unknown>).id ? record : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setRecords((prev) =>
              prev.filter((r) => (r as Record<string, unknown>).id !== (record as Record<string, unknown>).id)
            )
          }
          callbackRef.current?.(record)
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table])

  return { records, newRecord, isSubscribed }
}
