import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getActiveProfile } from '../services/nrl.service'
import { hasPermission, canAccessLevel } from '../services/rbac.service'
import type { NRLProfile } from '../types/rbac.types'
import type { AppUser } from '../types/auth.types'

export type NRLProfileWithRole = NRLProfile & { roleName?: string | null }

interface NRLState {
  nrlProfile: NRLProfileWithRole | null
  profile: NRLProfileWithRole | null
  isLoading: boolean
  error: string | null
  level: number
  needTags: string[]
  canAccess: (resource: string, action: string) => boolean
  checkLevel: (requiredLevel: number) => boolean
  refresh: () => Promise<void>
}

function buildFallbackProfile(user: AppUser): NRLProfileWithRole | null {
  if (typeof user.level !== 'number' || Number.isNaN(user.level)) {
    return null
  }

  return {
    id: `fallback-${user.id}`,
    userId: user.id,
    roleId: user.roleName ?? 'FALLBACK_ROLE',
    needTags: Array.isArray(user.needTags) ? user.needTags : [],
    level: user.level,
    validFrom: new Date(0).toISOString(),
    validUntil: null,
    isActive: true,
    roleName: user.roleName ?? 'FALLBACK',
  }
}

export function useNRL(): NRLState {
  const { user } = useAuth()
  const [nrlProfile, setNrlProfile] = useState<NRLProfileWithRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!user) {
      setNrlProfile(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const profile = await getActiveProfile(user.id)
      setNrlProfile((profile as NRLProfileWithRole | null) ?? buildFallbackProfile(user))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load NRL profile'
      setError(message)
      setNrlProfile(buildFallbackProfile(user))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const canAccess = useCallback(
    (resource: string, action: string): boolean => {
      if (!nrlProfile) return false
      return hasPermission(nrlProfile, resource, action)
    },
    [nrlProfile],
  )

  const checkLevel = useCallback(
    (requiredLevel: number): boolean => {
      if (!nrlProfile) return false
      return canAccessLevel(nrlProfile.level, requiredLevel)
    },
    [nrlProfile],
  )

  return {
    nrlProfile,
    profile: nrlProfile,
    isLoading,
    error,
    level: nrlProfile?.level ?? 0,
    needTags: nrlProfile?.needTags ?? [],
    canAccess,
    checkLevel,
    refresh: loadProfile,
  }
}
