import { useEffect, useRef, useState } from 'react'
import { securityConfig } from '../../config/security.config'
import { useAuth } from '../../hooks/useAuth'

const WARNING_BEFORE_MS = 5 * 60 * 1000
const CHECK_INTERVAL_MS = 30_000

export default function SessionTimeout() {
const { isAuthenticated, logout } = useAuth()
const [showWarning, setShowWarning] = useState(false)
const [minutesLeft, setMinutesLeft] = useState(0)
const lastActivityRef = useRef(0)
const timeoutMs = securityConfig.sessionTimeoutMinutes * 60 * 1000

useEffect(() => {
if (!isAuthenticated) return

lastActivityRef.current = Date.now()

const updateActivity = () => {
lastActivityRef.current = Date.now()
setShowWarning(false)
}

window.addEventListener('mousemove', updateActivity, { passive: true })
window.addEventListener('keydown', updateActivity, { passive: true })
window.addEventListener('click', updateActivity, { passive: true })

const interval = setInterval(() => {
const idle = Date.now() - lastActivityRef.current

if (idle >= timeoutMs) {
logout()
} else if (idle >= timeoutMs - WARNING_BEFORE_MS) {
setShowWarning(true)
setMinutesLeft(Math.max(1, Math.ceil((timeoutMs - idle) / 60_000)))
} else {
setShowWarning(false)
setMinutesLeft(0)
}
}, CHECK_INTERVAL_MS)

return () => {
window.removeEventListener('mousemove', updateActivity)
window.removeEventListener('keydown', updateActivity)
window.removeEventListener('click', updateActivity)
clearInterval(interval)
}
}, [isAuthenticated, logout, timeoutMs])

if (!showWarning) return null

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
<div className="bg-gray-900 border border-amber-500 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
<div className="flex items-center gap-3 mb-3">
<span className="text-amber-400 text-2xl">⚠</span>
<h2 className="text-amber-400 font-semibold text-lg">Session Expiring</h2>
</div>
<p className="text-gray-300 text-sm mb-5">
Your session will expire in approximately{' '}
<span className="text-white font-medium">{minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}</span>{' '}
due to inactivity.
</p>
<button
onClick={() => {
lastActivityRef.current = Date.now()
setShowWarning(false)
}}
className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
>
Stay Logged In
</button>
</div>
</div>
)
}
