import { isAdminRole } from '../utils/nrl.utils'
import type { NRLProfile, Permission } from '../types/rbac.types'

export function hasPermission(nrlProfile: NRLProfile, resource: string, action: string): boolean {
if (!nrlProfile.isActive) return false
if (isAdmin(nrlProfile.roleId)) return true
return false
}

export function hasPermissionFromList(nrlProfile: NRLProfile, permissions: Permission[], resource: string, action: string): boolean {
if (!nrlProfile.isActive) return false
if (isAdmin(nrlProfile.roleId)) return true

return permissions
.filter((p) => p.resource === resource && p.action === action)
.some((p) => {
const levelOk = canAccessLevel(nrlProfile.level, p.levelRequired)
const needOk = p.needRequired.length === 0 || p.needRequired.some((n) => hasNeed(nrlProfile.needTags, n))
return levelOk && needOk
})
}

export function canAccessLevel(userLevel: number, requiredLevel: number): boolean {
return userLevel >= requiredLevel
}

export function hasNeed(userNeeds: string[], requiredNeed: string): boolean {
return userNeeds.includes('ALL') || userNeeds.includes(requiredNeed)
}

export function isAdmin(roleName: string): boolean {
return isAdminRole(roleName)
}
