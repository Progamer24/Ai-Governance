import Card from '../../../components/ui/Card'
import type { AnomalyRecord } from '../../../hooks/useAdmin'

interface RiskHeatmapProps {
  anomalies?: AnomalyRecord[]
}

function getBucket(score: number): string {
  if (score >= 75) return 'Critical'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Medium'
  return 'Low'
}

const colorByBucket: Record<string, string> = {
  Critical: 'bg-red-500/60',
  High: 'bg-amber-500/60',
  Medium: 'bg-cyan-500/60',
  Low: 'bg-green-500/60',
}

export default function RiskHeatmap({ anomalies = [] }: RiskHeatmapProps) {
  const buckets = anomalies.reduce<Record<string, number>>((acc, item) => {
    const key = getBucket(item.risk_score)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, { Critical: 0, High: 0, Medium: 0, Low: 0 })

  return (
    <Card title="Threat Heatmap">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(buckets).map(([bucket, count]) => (
          <div key={bucket} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/60">{bucket}</span>
              <span className="text-xs text-white/40">{count}</span>
            </div>
            <div className="h-8 w-full rounded-md bg-white/10">
              <div
                className={`h-full rounded-md ${colorByBucket[bucket]}`}
                style={{ width: `${Math.min(100, count * 20)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
