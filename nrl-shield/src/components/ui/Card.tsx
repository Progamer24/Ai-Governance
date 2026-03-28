import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  headerActions?: ReactNode
  children: ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export default function Card({
  title,
  headerActions,
  children,
  className,
  padding = true,
  hover = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-colors',
        hover && 'hover:border-cyan/30',
        className,
      )}
    >
      {(title || headerActions) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          {title && <h3 className="text-white font-semibold">{title}</h3>}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={clsx(padding && 'p-5')}>{children}</div>
    </div>
  )
}
