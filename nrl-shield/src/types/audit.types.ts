export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AuditEvent {
	eventType: string
	actorId: string
	targetId?: string | null
	targetType?: string | null
	payload: Record<string, unknown>
	severity: AuditSeverity
}

export interface AuditLogRecord {
	id: string
	eventType: string
	actorId: string
	targetId: string | null
	targetType: string | null
	payloadEncrypted: string
	severity: AuditSeverity
	createdAt: string
}
