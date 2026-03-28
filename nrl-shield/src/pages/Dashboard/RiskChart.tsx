import Card from '../../components/ui/Card'
import AccessTrendLine from '../../components/charts/AccessTrendLine'

interface RiskChartProps {
  data?: Array<{ date: string; count: number }>
}

const DEMO_DATA = [
  { date: 'Mon', count: 22 },
  { date: 'Tue', count: 35 },
  { date: 'Wed', count: 28 },
  { date: 'Thu', count: 47 },
  { date: 'Fri', count: 31 },
  { date: 'Sat', count: 18 },
  { date: 'Sun', count: 42 },
]

export default function RiskChart({ data }: RiskChartProps) {
  return (
    <Card title="Risk Score Trend">
      <AccessTrendLine data={data ?? DEMO_DATA} height={220} />
    </Card>
  )
}
