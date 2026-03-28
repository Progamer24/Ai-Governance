export interface AdminAction {
	id: string
	actorId: string
	actionType: string
	targetId: string | null
	createdAt: string
}

export interface SystemHealth {
	activeUsers: number
	riskAlerts: number
	anomalyCount: number
	avgResponseTimeMs: number
	status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL'
}
