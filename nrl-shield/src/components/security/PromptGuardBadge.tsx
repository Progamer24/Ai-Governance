import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'
import { clsx } from 'clsx'

type GuardStatus = 'idle' | 'checking' | 'safe' | 'blocked'

interface PromptGuardBadgeProps {
	status?: GuardStatus
	blocked?: boolean
	reason?: string | null
}

const CONFIG = {
	idle: {
		icon: Shield,
		label: 'Guard Active',
		color: 'text-gray-400',
		border: 'border-gray-600',
		bg: 'bg-gray-800',
	},
	checking: {
		icon: Shield,
		label: 'Checking...',
		color: 'text-amber-400',
		border: 'border-amber-500',
		bg: 'bg-amber-950/40',
	},
	safe: {
		icon: ShieldCheck,
		label: 'Safe',
		color: 'text-cyan-400',
		border: 'border-cyan-500',
		bg: 'bg-cyan-950/40',
	},
	blocked: {
		icon: ShieldAlert,
		label: 'Blocked',
		color: 'text-red-400',
		border: 'border-red-600',
		bg: 'bg-red-950/40',
	},
} as const

export default function PromptGuardBadge({ status, blocked = false, reason = null }: PromptGuardBadgeProps): JSX.Element {
	const resolvedStatus: GuardStatus = status ?? (blocked ? 'blocked' : 'safe')
	const { icon: Icon, label, color, border, bg } = CONFIG[resolvedStatus]

	return (
		<motion.div
			animate={resolvedStatus === 'blocked' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
			transition={resolvedStatus === 'blocked' ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
			className={clsx(
				'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
				color,
				border,
				bg,
			)}
			role="status"
			aria-label={`Prompt guard: ${label}`}
		>
			<motion.span
				className="inline-flex"
				animate={resolvedStatus === 'checking' ? { rotate: 360 } : { rotate: 0 }}
				transition={resolvedStatus === 'checking' ? { duration: 1.2, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
			>
				<Icon className="h-3.5 w-3.5" />
			</motion.span>
			<span>{label}</span>
			{reason && resolvedStatus === 'blocked' && <span className="opacity-80">- {reason}</span>}
		</motion.div>
	)
}
