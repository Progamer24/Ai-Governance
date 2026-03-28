import { useState, useCallback } from 'react'
import { supabase } from '../config/supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  department: string | null
  is_active: boolean
  is_mfa_enabled: boolean
  nrl_level?: number
  nrl_need_tags?: string[]
  nrl_role_id?: string
}

export interface AnomalyRecord {
  id: string
  user_id: string
  anomaly_type: string
  risk_score: number
  detected_at: string
  status: string
  metadata?: Record<string, unknown>
}

export function useAdmin() {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setUsers((data ?? []) as UserProfile[])
      return (data ?? []) as UserProfile[]
    } catch (err) {
      console.error('Failed to fetch users:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: string, data: Partial<UserProfile>) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', id)
    if (error) throw error
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
  }, [])

  const lockUser = useCallback(async (id: string) => {
    await updateUser(id, { is_active: false })
  }, [updateUser])

  const unlockUser = useCallback(async (id: string) => {
    await updateUser(id, { is_active: true })
  }, [updateUser])

  const fetchAnomalies = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('anomalies').select('*').order('detected_at', { ascending: false })
      if (error) throw error
      setAnomalies((data ?? []) as AnomalyRecord[])
      return (data ?? []) as AnomalyRecord[]
    } catch (err) {
      console.error('Failed to fetch anomalies:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resolveAnomaly = useCallback(async (id: string) => {
    const { error } = await supabase.from('anomalies').update({ status: 'RESOLVED' }).eq('id', id)
    if (error) throw error
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a)))
  }, [])

  return { isLoading, fetchUsers, updateUser, lockUser, unlockUser, fetchAnomalies, resolveAnomaly, users, anomalies }
}
