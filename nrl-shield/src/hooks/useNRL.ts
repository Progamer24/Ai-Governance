import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getActiveProfile } from '../services/nrl.service'
import { hasPermission, canAccessLevel } from '../services/rbac.service'
import type { NRLProfile } from '../types/rbac.types'

export function useNRL() {
const { user } = useAuth()
const [nrlProfile, setNrlProfile] = useState<NRLProfile | null>(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
if (!user) {
setNrlProfile(null)
setIsLoading(false)
return
}

setIsLoading(true)
getActiveProfile(user.id)
.then((profile) => setNrlProfile(profile))
.catch(() => setNrlProfile(null))
.finally(() => setIsLoading(false))
}, [user])

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
isLoading,
level: nrlProfile?.level ?? 0,
needTags: nrlProfile?.needTags ?? [],
canAccess,
checkLevel,
}
}
