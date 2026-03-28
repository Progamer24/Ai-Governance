import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import type { AuditLogRecord, AuditSeverity } from '../../types/audit.types'

interface LogDetailProps {
  log: AuditLogRecord | null
  isOpen: boolean
  onClose: () => void
}

const severityVariant: Record<AuditSeverity, 'default' | 'info' | 'warning' | 'danger' | 'success'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 font-mono uppercase tracking-widest col-span-1">{label}</span>
      <span className="col-span-2 text-sm text-white/80 font-mono break-all">
        {children ?? (value || <span className="text-white/20">—</span>)}
      </span>
    </div>
  )
}

export default function LogDetail({ log, isOpen, onClose }: LogDetailProps) {
  if (!log) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Detail" size="lg">
      <div className="divide-y divide-white/5">
        <Field label="ID" value={log.id} />
        <Field label="Event Type" value={log.eventType} />
        <Field label="Actor ID" value={log.actorId} />
        <Field label="Target ID" value={log.targetId} />
        <Field label="Target Type" value={log.targetType} />
        <Field label="Severity">
          <Badge variant={severityVariant[log.severity]}>{log.severity}</Badge>
        </Field>
        <Field label="Created At" value={new Date(log.createdAt).toLocaleString()} />
        <Field label="Payload">
          <div className="inline-flex items-center gap-1.5">
            <Badge variant="warning">ENCRYPTED</Badge>
            <span className="text-white/30 text-xs">[AES-256-GCM]</span>
          </div>
        </Field>
      </div>
    </Modal>
  )
}
