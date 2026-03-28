import { Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Button from '../../components/ui/Button'
import { toCSV } from '../../utils/exportCSV.utils'
import type { AuditLogRecord } from '../../types/audit.types'

interface ExportPanelProps {
  logs: AuditLogRecord[]
}

export default function ExportPanel({ logs }: ExportPanelProps) {
  const handleCSV = () => {
    const rows = logs.map((l) => ({
      Time: new Date(l.createdAt).toISOString(),
      'Event Type': l.eventType,
      'Actor ID': l.actorId,
      'Target ID': l.targetId ?? '',
      Severity: l.severity,
    }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('NRL Shield — Audit Logs', 14, 16)
    doc.setFontSize(9)
    doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 22)

    autoTable(doc, {
      startY: 28,
      head: [['Time', 'Event Type', 'Actor ID', 'Target ID', 'Severity']],
      body: logs.map((l) => [
        new Date(l.createdAt).toLocaleString(),
        l.eventType,
        l.actorId,
        l.targetId ?? '—',
        l.severity,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [4, 8, 16] },
    })

    doc.save(`audit_logs_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={handleCSV} className="flex items-center gap-1.5">
        <Download size={13} />
        Export CSV
      </Button>
      <Button variant="secondary" size="sm" onClick={handlePDF} className="flex items-center gap-1.5">
        <FileText size={13} />
        Export PDF
      </Button>
    </div>
  )
}
