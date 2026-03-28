const LAST_ACTIVE_KEY = 'nrl_last_active'
const SESSION_ID_KEY = 'nrl_session_id'
const POLL_INTERVAL_MS = 15_000

export class SessionMonitor {
private intervalId: ReturnType<typeof setInterval> | null = null
private userId: string | null = null
private onAnomalyDetected: (() => void) | null = null

start(userId: string, onAnomalyDetected: () => void): void {
this.userId = userId
this.onAnomalyDetected = onAnomalyDetected

const currentSessionId = localStorage.getItem(SESSION_ID_KEY)
if (!currentSessionId) {
localStorage.setItem(SESSION_ID_KEY, this.generateSessionId())
}

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
this.userId = null
this.onAnomalyDetected = null
}

private poll(): void {
const storedId = localStorage.getItem(SESSION_ID_KEY)
const expectedId = sessionStorage.getItem(`nrl_sid_${this.userId}`)

if (expectedId && storedId && storedId !== expectedId) {
this.onAnomalyDetected?.()
}
}

private updateLastActive(): void {
localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
if (this.userId) {
const sid = this.generateSessionId()
sessionStorage.setItem(`nrl_sid_${this.userId}`, sid)
localStorage.setItem(SESSION_ID_KEY, sid)
}
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
