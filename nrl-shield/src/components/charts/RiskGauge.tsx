import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'

interface RiskGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 120, md: 180, lg: 240 }

function getColor(score: number): string {
  if (score < 40) return '#00FF9D'
  if (score <= 70) return '#FFB800'
  return '#FF3355'
}

export default function RiskGauge({ score, size = 'md' }: RiskGaugeProps) {
  const dim = sizeMap[size]
  const color = getColor(score)
  const data = [{ value: score, fill: color }]

  return (
    <div className={clsx('relative inline-flex items-center justify-center')} style={{ width: dim, height: dim }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="65%"
          outerRadius="90%"
          startAngle={225}
          endAngle={-45}
          data={data}
          barSize={size === 'sm' ? 8 : 12}
        >
          <RadialBar
            background={{ fill: 'rgba(255,255,255,0.05)' }}
            dataKey="value"
            cornerRadius={6}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={clsx('font-mono font-bold leading-none', size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl')} style={{ color }}>
          {score}
        </span>
        <span className="text-white/40 text-xs font-mono mt-0.5">RISK</span>
      </div>
    </div>
  )
}
