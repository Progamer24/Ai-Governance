export class RateLimiter {
private tokens: number
private readonly maxTokens: number
private readonly refillRatePerMs: number
private lastRefillTime: number

constructor(maxTokens: number, refillRatePerMinute: number) {
this.maxTokens = maxTokens
this.tokens = maxTokens
this.refillRatePerMs = refillRatePerMinute / 60_000
this.lastRefillTime = Date.now()
}

consume(): boolean {
this.refill()
if (this.tokens < 1) return false
this.tokens -= 1
return true
}

private refill(): void {
const now = Date.now()
const elapsed = now - this.lastRefillTime
const tokensToAdd = elapsed * this.refillRatePerMs
this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
this.lastRefillTime = now
}
}
