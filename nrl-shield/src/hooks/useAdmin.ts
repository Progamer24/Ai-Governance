import { useState, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { mockAnomalies, mockPipelineEvents, mockPolicies, mockRoles, mockUsers } from '../data/mockData'

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

export interface RoleDefinition {
  id: string
  name: string
  description: string
  level: number
  department: string
  needTags: string[]
}

export interface PolicyDefinition {
  id: string
  name: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  threshold: number
  enabled: boolean
  appliesToRoles: string[]
  createdAt: string
}

export interface PipelineEvent {
  id: string
  stage: 'INGEST' | 'GUARD' | 'NRL' | 'MODEL' | 'FILTER' | 'AUDIT'
  status: 'SUCCESS' | 'WARNING' | 'ERROR'
  latencyMs: number
  message: string
  createdAt: string
}

const LS_ROLES_KEY = 'nrl.admin.roles'
const LS_POLICIES_KEY = 'nrl.admin.policies'

function readLocalState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeLocalState<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function useAdmin() {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>(() => readLocalState(LS_ROLES_KEY, mockRoles))
  const [policies, setPolicies] = useState<PolicyDefinition[]>(() => readLocalState(LS_POLICIES_KEY, mockPolicies))
  const [pipelineEvents, setPipelineEvents] = useState<PipelineEvent[]>(mockPipelineEvents)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error || !data || data.length === 0) {
        setUsers(mockUsers)
        return mockUsers
      }
      setUsers(data as UserProfile[])
      return data as UserProfile[]
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers(mockUsers)
      return mockUsers
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: string, data: Partial<UserProfile>) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', id)
    if (error) {
      console.warn('Supabase update failed; applying local-only update', error.message)
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
  }, [])

  const createUser = useCallback(async (data: UserProfile) => {
    const { error } = await supabase.from('profiles').insert({
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      department: data.department,
      is_active: data.is_active,
      is_mfa_enabled: data.is_mfa_enabled,
      nrl_level: data.nrl_level,
      nrl_need_tags: data.nrl_need_tags,
      nrl_role_id: data.nrl_role_id,
    })
    if (error) {
      console.warn('Supabase create failed; applying local-only create', error.message)
    }
    setUsers((prev) => [data, ...prev])
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      console.warn('Supabase delete failed; applying local-only delete', error.message)
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
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
      if (error || !data || data.length === 0) {
        setAnomalies(mockAnomalies)
        return mockAnomalies
      }
      setAnomalies(data as AnomalyRecord[])
      return data as AnomalyRecord[]
    } catch (err) {
      console.error('Failed to fetch anomalies:', err)
      setAnomalies(mockAnomalies)
      return mockAnomalies
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resolveAnomaly = useCallback(async (id: string) => {
    const { error } = await supabase.from('anomalies').update({ status: 'RESOLVED' }).eq('id', id)
    if (error) {
      console.warn('Supabase anomaly update failed; applying local-only resolve', error.message)
    }
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a)))
  }, [])

  const fetchRoles = useCallback(async () => {
    return roles
  }, [roles])

  const createRole = useCallback((role: Omit<RoleDefinition, 'id'>) => {
    const next: RoleDefinition = { ...role, id: `role-${crypto.randomUUID()}` }
    setRoles((prev) => {
      const updated = [next, ...prev]
      writeLocalState(LS_ROLES_KEY, updated)
      return updated
    })
  }, [])

  const updateRole = useCallback((id: string, patch: Partial<RoleDefinition>) => {
    setRoles((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      writeLocalState(LS_ROLES_KEY, updated)
      return updated
    })
  }, [])

  const fetchPolicies = useCallback(async () => {
    return policies
  }, [policies])

  const createPolicy = useCallback((policy: Omit<PolicyDefinition, 'id' | 'createdAt'>) => {
    const next: PolicyDefinition = {
      ...policy,
      id: `policy-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    }
    setPolicies((prev) => {
      const updated = [next, ...prev]
      writeLocalState(LS_POLICIES_KEY, updated)
      return updated
    })
  }, [])

  const updatePolicy = useCallback((id: string, patch: Partial<PolicyDefinition>) => {
    setPolicies((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      writeLocalState(LS_POLICIES_KEY, updated)
      return updated
    })
  }, [])

  const pushPipelineEvent = useCallback((event: Omit<PipelineEvent, 'id' | 'createdAt'>) => {
    setPipelineEvents((prev) => [
      {
        ...event,
        id: `pipe-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 100))
  }, [])

  return {
    isLoading,
    fetchUsers,
    updateUser,
    createUser,
    deleteUser,
    lockUser,
    unlockUser,
    fetchAnomalies,
    resolveAnomaly,
    fetchRoles,
    createRole,
    updateRole,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    pushPipelineEvent,
    users,
    anomalies,
    roles,
    policies,
    pipelineEvents,
  }
}
