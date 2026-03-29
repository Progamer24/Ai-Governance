import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import type { AnomalyRecord } from '../../../hooks/useAdmin'

interface AnomalyListProps {
  anomalies: AnomalyRecord[]
  canResolve: boolean
  onResolve: (id: string) => void
}

export default function AnomalyList({ anomalies, canResolve, onResolve }: AnomalyListProps) {
  return (
    <Card title="Live Anomaly Queue">
      <div className="space-y-2">
        {anomalies.map((anomaly) => (
          <div key={anomaly.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-white">{anomaly.anomaly_type}</p>
                <p className="text-xs text-white/50">User: {anomaly.user_id} • {new Date(anomaly.detected_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={anomaly.risk_score >= 75 ? 'danger' : anomaly.risk_score >= 50 ? 'warning' : 'info'}>
                  Risk {anomaly.risk_score}
                </Badge>
                <Badge variant={anomaly.status === 'RESOLVED' ? 'success' : 'warning'}>
                  {anomaly.status}
                </Badge>
                {canResolve && anomaly.status !== 'RESOLVED' ? (
                  <Button variant="secondary" size="sm" onClick={() => onResolve(anomaly.id)}>
                    Resolve
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {anomalies.length === 0 ? <p className="text-sm text-white/50">No anomalies detected.</p> : null}
      </div>
    </Card>
  )
}
