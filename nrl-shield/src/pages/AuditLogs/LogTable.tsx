import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import type { AuditLogRecord, AuditSeverity } from '../../types/audit.types'

interface LogTableProps {
  logs: AuditLogRecord[]
  isLoading: boolean
  onRowClick: (log: AuditLogRecord) => void
}

const severityVariant: Record<AuditSeverity, 'default' | 'info' | 'warning' | 'danger' | 'success'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
}

const PAGE_SIZE = 20

export default function LogTable({ logs, isLoading, onRowClick }: LogTableProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE))
  const pageData = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const columns = [
    {
      key: 'createdAt',
      label: 'Time',
      render: (value: unknown) => (
        <span className="text-xs font-mono text-white/60">
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'eventType',
      label: 'Event Type',
      render: (value: unknown) => (
        <span className="font-mono text-xs text-white">{value as string}</span>
      ),
    },
    {
      key: 'actorId',
      label: 'Actor',
      render: (value: unknown) => (
        <span className="font-mono text-xs text-white/70 truncate max-w-[120px] block">
          {(value as string).slice(0, 12)}…
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value: unknown) => (
        <Badge variant={severityVariant[value as AuditSeverity]}>{value as string}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={pageData as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        onRowClick={(row) => onRowClick(row as unknown as AuditLogRecord)}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-sm">
          <span className="text-white/40 text-xs font-mono">
            Page {page + 1} of {totalPages} ({logs.length} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
