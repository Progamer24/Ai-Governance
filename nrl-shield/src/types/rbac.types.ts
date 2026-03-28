export type PermissionAction = 'READ' | 'WRITE' | 'DELETE' | 'QUERY_AI'

export interface Role {
	id: string
	name: string
	description: string
	level: number
	department: string | null
	isSystemRole: boolean
}

export interface Permission {
	id: string
	name: string
	resource: string
	action: PermissionAction
	levelRequired: number
	needRequired: string[]
}

export interface NRLProfile {
	id: string
	userId: string
	roleId: string
	needTags: string[]
	level: number
	validFrom: string
	validUntil: string | null
	isActive: boolean
}

export interface Policy {
	id: string
	name: string
	description: string
	rules: Record<string, unknown>
	appliesToRoles: string[]
	isActive: boolean
	priority: number
}
