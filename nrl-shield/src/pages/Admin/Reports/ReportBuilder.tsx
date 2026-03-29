import { useMemo, useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { useAdmin } from '../../../hooks/useAdmin'

function downloadCsv(fileName: string, rows: string[][]): void {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function ReportBuilder() {
  const { users, anomalies, policies, pipelineEvents } = useAdmin()
  const [reportType, setReportType] = useState<'security' | 'pipeline' | 'policy'>('security')

  const reportRows = useMemo(() => {
    if (reportType === 'pipeline') {
      return [
        ['Stage', 'Status', 'LatencyMs', 'Message', 'CreatedAt'],
        ...pipelineEvents.map((e) => [e.stage, e.status, String(e.latencyMs), e.message, e.createdAt]),
      ]
    }

    if (reportType === 'policy') {
      return [
        ['Policy', 'Severity', 'Threshold', 'Enabled', 'Roles'],
        ...policies.map((p) => [p.name, p.severity, String(p.threshold), String(p.enabled), p.appliesToRoles.join('|')]),
      ]
    }

    return [
      ['User', 'Email', 'Level', 'Role', 'OpenThreats'],
      ...users.map((u) => [
        u.full_name ?? '-',
        u.email,
        String(u.nrl_level ?? '-'),
        u.nrl_role_id ?? '-',
        String(anomalies.filter((a) => a.user_id === u.id && a.status !== 'RESOLVED').length),
      ]),
    ]
  }, [anomalies, pipelineEvents, policies, reportType, users])

  return (
    <Card title="Report Builder">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as 'security' | 'pipeline' | 'policy')}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="security">Security Snapshot</option>
          <option value="pipeline">Pipeline Latency</option>
          <option value="policy">Policy Coverage</option>
        </select>

        <Button
          variant="primary"
          onClick={() => downloadCsv(`nrl-${reportType}-report.csv`, reportRows)}
        >
          Download CSV
        </Button>
      </div>
    </Card>
  )
}
