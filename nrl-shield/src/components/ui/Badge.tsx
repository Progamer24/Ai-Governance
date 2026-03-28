import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/10 text-white/70 border-white/20',
  success: 'bg-neon/10 text-neon border-neon/30',
  warning: 'bg-amber/10 text-amber border-amber/30',
  danger: 'bg-crimson/10 text-crimson border-crimson/30',
  info: 'bg-cyan/10 text-cyan border-cyan/30',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs rounded-full border font-mono',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
