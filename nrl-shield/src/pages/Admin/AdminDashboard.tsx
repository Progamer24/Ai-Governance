import { useEffect, useState, useCallback } from 'react'
import { Users, Activity, AlertTriangle, RefreshCw } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { supabase } from '../../config/supabase'
import RiskHeatmap from './ThreatMonitor/RiskHeatmap'
import type { SystemHealth } from '../../types/admin.types'

interface DashboardStats {
  activeUsers: number
  totalQueriesToday: number
  anomaliesCount: number
  systemStatus: SystemHealth['status']
}

interface AnomalyPreview {
  id: string
  user_id: string
  anomaly_type: string
  risk_score: number
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    totalQueriesToday: 0,
    anomaliesCount: 0,
    systemStatus: 'HEALTHY',
  })
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, anomaliesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('anomalies').select('id,user_id,anomaly_type,risk_score,status').order('detected_at', { ascending: false }).limit(5),
      ])

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const queriesRes = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('event_type', 'AI_QUERY')
        .gte('created_at', todayStart.toISOString())

      const activeUsers = usersRes.count ?? 0
      const anomaliesCount = (anomaliesRes.data ?? []).filter((a) => a.status !== 'RESOLVED').length
      const totalQueriesToday = queriesRes.count ?? 0

      const systemStatus: SystemHealth['status'] =
        anomaliesCount > 10 ? 'CRITICAL' : anomaliesCount > 3 ? 'DEGRADED' : 'HEALTHY'

      setStats({ activeUsers, totalQueriesToday, anomaliesCount, systemStatus })
      setRecentAnomalies((anomaliesRes.data ?? []) as AnomalyPreview[])
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const statusVariant = stats.systemStatus === 'HEALTHY' ? 'success' : stats.systemStatus === 'DEGRADED' ? 'warning' : 'danger'

  return (
    <PageWrapper title="Admin Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white/60 text-sm">System Health Overview</h2>
          <Button variant="ghost" size="sm" loading={isLoading} onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <Users className="w-8 h-8 text-cyan mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
            <div className="text-white/60 text-sm">Active Users</div>
          </Card>
          <Card className="text-center">
            <Activity className="w-8 h-8 text-neon mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.totalQueriesToday}</div>
            <div className="text-white/60 text-sm">Queries Today</div>
          </Card>
          <Card className="text-center">
            <AlertTriangle className="w-8 h-8 text-amber mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.anomaliesCount}</div>
            <div className="text-white/60 text-sm">Anomalies</div>
          </Card>
          <Card className="text-center">
            <div className="text-sm text-white/60 mb-2">System Status</div>
            <Badge variant={statusVariant}>{stats.systemStatus}</Badge>
          </Card>
        </div>

        <RiskHeatmap />

        <Card title="Recent Anomalies">
          {recentAnomalies.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No recent anomalies</p>
          ) : (
            <div className="space-y-2">
              {recentAnomalies.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white text-sm">{a.anomaly_type}</span>
                    <span className="text-white/40 text-xs ml-2">user: {a.user_id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${a.risk_score >= 80 ? 'text-crimson' : a.risk_score >= 40 ? 'text-amber' : 'text-neon'}`}>
                      {a.risk_score}
                    </span>
                    <Badge variant={a.status === 'RESOLVED' ? 'success' : 'danger'}>{a.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
