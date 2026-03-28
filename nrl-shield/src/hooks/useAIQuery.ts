import { useState, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useNRL } from './useNRL'
import { sendQuery as aiSendQuery } from '../services/ai.service'
import { checkPrompt, quickCheck } from '../services/promptGuard.service'
import { RateLimiter } from '../middleware/rateLimiter'
import { securityConfig } from '../config/security.config'
import type { AIResponse } from '../types/ai.types'

const rateLimiter = new RateLimiter(securityConfig.maxQueriesPerHour, securityConfig.maxQueriesPerHour)

export function useAIQuery() {
const { session } = useAuth()
const { nrlProfile } = useNRL()
const [isLoading, setIsLoading] = useState(false)
const [lastResponse, setLastResponse] = useState<AIResponse | null>(null)
const [error, setError] = useState<string | null>(null)
const abortRef = useRef<AbortController | null>(null)

const sendQuery = useCallback(
async (query: string): Promise<AIResponse | null> => {
setError(null)

if (!session?.access_token) {
setError('Not authenticated')
return null
}

if (!nrlProfile?.isActive) {
setError('No active NRL profile')
return null
}

if (!rateLimiter.consume()) {
setError('Rate limit exceeded. Please wait before sending another query.')
return null
}

// Fast local check first
if (quickCheck(query)) {
setError('Query blocked: potential injection detected')
return null
}

setIsLoading(true)
abortRef.current = new AbortController()

try {
const guardResult = await checkPrompt(query, session.access_token)
if (!guardResult.isSafe) {
setError(`Query blocked: ${guardResult.reason}`)
return null
}

const sessionToken = session.access_token
const result = await aiSendQuery(query, sessionToken, session.access_token)

setLastResponse(result)
return result
} catch (err) {
const msg = err instanceof Error ? err.message : 'Unknown error'
setError(msg)
return null
} finally {
setIsLoading(false)
}
},
[session, nrlProfile],
)

return { sendQuery, isLoading, lastResponse, error }
}
