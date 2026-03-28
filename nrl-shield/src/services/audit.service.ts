import { supabase } from '../config/supabase'
import type { AuditEvent, AuditLogRecord, ExplainabilityReceipt } from '../types/audit.types'

function mapAuditRow(row: Record<string, unknown>): AuditLogRecord {
	return {
		id: String(row.id ?? ''),
		eventType: String(row.event_type ?? ''),
		actorId: String(row.actor_id ?? ''),
		targetId: row.target_id ? String(row.target_id) : null,
		targetType: row.target_type ? String(row.target_type) : null,
		payloadEncrypted: String(row.payload_encrypted ?? ''),
		severity: (String(row.severity ?? 'LOW') as AuditLogRecord['severity']),
		createdAt: String(row.created_at ?? new Date().toISOString()),
	}
}

export async function fetchAuditLogs(limit = 100): Promise<AuditLogRecord[]> {
	const { data, error } = await supabase
		.from('audit_logs')
		.select('id, event_type, actor_id, target_id, target_type, payload_encrypted, severity, created_at')
		.order('created_at', { ascending: false })
		.limit(limit)

	if (error || !data) {
		return []
	}

	return data.map((row) => mapAuditRow(row as Record<string, unknown>))
}

export async function writeAuditEvent(input: AuditEvent): Promise<void> {
	await supabase.functions.invoke('audit-writer', {
		body: {
			event_type: input.eventType,
			actor_id: input.actorId,
			target_id: input.targetId ?? null,
			target_type: input.targetType ?? null,
			payload: input.payload,
			severity: input.severity,
		},
	})
}

export async function fetchExplainabilityReceiptByQueryId(queryId: string): Promise<ExplainabilityReceipt | null> {
	const { data, error } = await supabase
		.from('explainability_receipts')
		.select('id, query_id, user_id, receipt_payload, receipt_signature, created_at')
		.eq('query_id', queryId)
		.maybeSingle()

	if (error || !data) {
		return null
	}

	const row = data as Record<string, unknown>
	return {
		id: String(row.id ?? ''),
		queryId: String(row.query_id ?? ''),
		userId: String(row.user_id ?? ''),
		receiptPayload: (row.receipt_payload as Record<string, unknown>) ?? {},
		receiptSignature: String(row.receipt_signature ?? ''),
		createdAt: String(row.created_at ?? new Date().toISOString()),
	}
}

export async function fetchExplainabilityReceiptById(receiptId: string): Promise<ExplainabilityReceipt | null> {
	const { data, error } = await supabase
		.from('explainability_receipts')
		.select('id, query_id, user_id, receipt_payload, receipt_signature, created_at')
		.eq('id', receiptId)
		.maybeSingle()

	if (error || !data) {
		return null
	}

	const row = data as Record<string, unknown>
	return {
		id: String(row.id ?? ''),
		queryId: String(row.query_id ?? ''),
		userId: String(row.user_id ?? ''),
		receiptPayload: (row.receipt_payload as Record<string, unknown>) ?? {},
		receiptSignature: String(row.receipt_signature ?? ''),
		createdAt: String(row.created_at ?? new Date().toISOString()),
	}
}

export async function logEvent(event: AuditEvent): Promise<void> {
	await supabase.from('audit_logs').insert({
		event_type: event.eventType,
		actor_id: event.actorId,
		target_id: event.targetId ?? null,
		target_type: event.targetType ?? null,
		payload_encrypted: JSON.stringify(event.payload),
		severity: event.severity,
	})
}
