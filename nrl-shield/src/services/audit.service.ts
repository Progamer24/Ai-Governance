import { supabase } from '../config/supabase'
import type { AuditEvent } from '../types/audit.types'

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
