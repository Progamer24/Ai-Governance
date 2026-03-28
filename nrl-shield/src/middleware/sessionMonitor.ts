const LAST_ACTIVE_KEY = 'nrl_last_active'
const POLL_INTERVAL_MS = 15_000

export class SessionMonitor {
private intervalId: ReturnType<typeof setInterval> | null = null
private onAnomalyDetected: (() => void) | null = null
private sessionKey: string | null = null
private expectedSessionId: string | null = null

start(userId: string, onAnomalyDetected: () => void): void {
this.onAnomalyDetected = onAnomalyDetected
this.sessionKey = `nrl_sid_${userId}`

// Generate the canonical session ID once and store it in sessionStorage
// (tab-scoped). localStorage stores a copy that other tabs could overwrite,
// which is the hijack signal we watch for.
this.expectedSessionId = this.generateSessionId()
sessionStorage.setItem(this.sessionKey, this.expectedSessionId)
localStorage.setItem(this.sessionKey, this.expectedSessionId)

this.updateLastActive()
this.attachActivityListeners()

this.intervalId = setInterval(() => this.poll(), POLL_INTERVAL_MS)
}

stop(): void {
if (this.intervalId !== null) {
clearInterval(this.intervalId)
this.intervalId = null
}
this.removeActivityListeners()
this.onAnomalyDetected = null
this.sessionKey = null
this.expectedSessionId = null
}

private poll(): void {
if (!this.sessionKey || !this.expectedSessionId) return

const storedInLocal = localStorage.getItem(this.sessionKey)

// If localStorage was modified by a different tab/context the IDs diverge,
// signalling a potential session hijack.
if (storedInLocal && storedInLocal !== this.expectedSessionId) {
this.onAnomalyDetected?.()
}
}

private updateLastActive(): void {
localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
}

private generateSessionId(): string {
return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

private handleActivity = (): void => {
this.updateLastActive()
}

private attachActivityListeners(): void {
window.addEventListener('mousemove', this.handleActivity, { passive: true })
window.addEventListener('keydown', this.handleActivity, { passive: true })
window.addEventListener('click', this.handleActivity, { passive: true })
}

private removeActivityListeners(): void {
window.removeEventListener('mousemove', this.handleActivity)
window.removeEventListener('keydown', this.handleActivity)
window.removeEventListener('click', this.handleActivity)
}
}
