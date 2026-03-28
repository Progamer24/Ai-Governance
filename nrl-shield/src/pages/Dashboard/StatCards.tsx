import { useEffect, useRef, useState } from 'react'
import { Users, Bot, AlertTriangle, ShieldAlert, type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface StatData {
  activeUsers?: number
  aiQueries?: number
  anomalies?: number
  riskAlerts?: number
}

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconClass: string
  borderClass: string
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

function StatCard({ label, value, icon: Icon, iconClass, borderClass }: StatCardProps) {
  const count = useCountUp(value)
  return (
    <div className={clsx(
      'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-200',
      'hover:border-opacity-40', borderClass,
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">{label}</p>
          <p className={clsx('text-3xl font-bold font-mono', iconClass)}>{count.toLocaleString()}</p>
        </div>
        <div className={clsx('p-2 rounded-lg bg-white/5', iconClass)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default function StatCards({ data }: { data?: StatData }) {
  const cards: StatCardProps[] = [
    { label: 'Active Users', value: data?.activeUsers ?? 0, icon: Users, iconClass: 'text-cyan', borderClass: 'hover:border-cyan/30' },
    { label: 'AI Queries Today', value: data?.aiQueries ?? 0, icon: Bot, iconClass: 'text-neon', borderClass: 'hover:border-neon/30' },
    { label: 'Anomalies Detected', value: data?.anomalies ?? 0, icon: AlertTriangle, iconClass: 'text-amber', borderClass: 'hover:border-amber/30' },
    { label: 'Risk Alerts', value: data?.riskAlerts ?? 0, icon: ShieldAlert, iconClass: 'text-crimson', borderClass: 'hover:border-crimson/30' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
