import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, ShieldOff, Shield } from 'lucide-react'
import { clsx } from 'clsx'

interface PromptGuardBadgeProps {
status: 'idle' | 'checking' | 'safe' | 'blocked'
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
label: 'Checking…',
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

const unusedIcon = ShieldOff

export default function PromptGuardBadge({ status }: PromptGuardBadgeProps) {
void unusedIcon
const { icon: Icon, label, color, border, bg } = CONFIG[status]

return (
<motion.div
animate={
status === 'checking'
? { rotate: 360 }
: status === 'blocked'
? { scale: [1, 1.08, 1] }
: { rotate: 0, scale: 1 }
}
transition={
status === 'checking'
? { duration: 1.2, repeat: Infinity, ease: 'linear' }
: status === 'blocked'
? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
: { duration: 0.2 }
}
className={clsx(
'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium',
color,
border,
bg,
)}
role="status"
aria-label={`Prompt guard: ${label}`}
>
<Icon className="w-3.5 h-3.5" />
<span>{label}</span>
</motion.div>
)
}
