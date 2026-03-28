import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface SpinnerProps {
size?: 'sm' | 'md' | 'lg'
className?: string
}

const sizeClasses = {
sm: 'w-4 h-4 border-2',
md: 'w-8 h-8 border-2',
lg: 'w-12 h-12 border-4',
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
return (
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
className={clsx(
'rounded-full border-cyan-400 border-t-transparent',
sizeClasses[size],
className,
)}
role="status"
aria-label="Loading"
/>
)
}
