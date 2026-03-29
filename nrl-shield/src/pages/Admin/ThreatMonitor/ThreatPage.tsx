import { useEffect } from 'react'
import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { useAdmin } from '../../../hooks/useAdmin'
import { useNRL } from '../../../hooks/useNRL'
import { useRealtime } from '../../../hooks/useRealtime'
import RiskHeatmap from './RiskHeatmap'
import AnomalyList from './AnomalyList'

type RealtimeAIQuery = {
  id?: string
  risk_score?: number
  created_at?: string
}

export default function ThreatPage() {
  const { anomalies, fetchAnomalies, resolveAnomaly, pipelineEvents, pushPipelineEvent } = useAdmin()
  const { level } = useNRL()
  const canManageThreats = level >= 5
  const { records: liveQueries, isSubscribed } = useRealtime<RealtimeAIQuery>('ai_queries')

  useEffect(() => {
    void fetchAnomalies()
  }, [fetchAnomalies])

  useEffect(() => {
    const last = liveQueries[liveQueries.length - 1]
    if (!last) return
    pushPipelineEvent({
      stage: 'AUDIT',
      status: (last.risk_score ?? 0) >= 75 ? 'WARNING' : 'SUCCESS',
      latencyMs: Math.round(Math.random() * 150) + 25,
      message: `Live query observed with risk ${(last.risk_score ?? 0).toFixed(0)}`,
    })
  }, [liveQueries, pushPipelineEvent])

  return (
    <PageWrapper title="Threat Monitor">
      <div className="space-y-4">
        <Card title="Live Analysis Pipeline">
          <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
            <span>Realtime Subscription:</span>
            <Badge variant={isSubscribed ? 'success' : 'warning'}>{isSubscribed ? 'CONNECTED' : 'DISCONNECTED'}</Badge>
          </div>
          <div className="space-y-2">
            {pipelineEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.status === 'ERROR' ? 'danger' : event.status === 'WARNING' ? 'warning' : 'success'}>
                      {event.status}
                    </Badge>
                    <span className="text-white/80 font-mono">{event.stage}</span>
                    <span className="text-white/50 text-xs">{event.latencyMs}ms</span>
                  </div>
                  <span className="text-white/40 text-xs">{new Date(event.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">{event.message}</p>
              </div>
            ))}
          </div>
        </Card>

        <RiskHeatmap anomalies={anomalies} />

        <AnomalyList anomalies={anomalies} canResolve={canManageThreats} onResolve={(id) => void resolveAnomaly(id)} />
      </div>
    </PageWrapper>
  )
}
