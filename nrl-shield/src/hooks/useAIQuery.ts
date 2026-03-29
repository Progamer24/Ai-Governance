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
async (query: string, preferredModel?: string): Promise<AIResponse> => {
setError(null)

if (!session?.access_token) {
const message = 'Not authenticated'
setError(message)
throw new Error(message)
}

if (!nrlProfile?.isActive) {
const message = 'No active NRL profile'
setError(message)
throw new Error(message)
}

if (!rateLimiter.consume()) {
const message = 'Rate limit exceeded. Please wait before sending another query.'
setError(message)
throw new Error(message)
}

// Fast local check first
if (quickCheck(query)) {
const message = 'Query blocked: potential injection detected'
setError(message)
throw new Error(message)
}

setIsLoading(true)
abortRef.current = new AbortController()

try {
const guardResult = await checkPrompt(query, session.access_token)
if (!guardResult.isSafe) {
const message = `Query blocked: ${guardResult.reason}`
setError(message)
throw new Error(message)
}

const sessionToken = session.access_token
const result = await aiSendQuery(query, sessionToken, session.access_token, preferredModel)

setLastResponse(result)
return result
} catch (err) {
const msg = err instanceof Error ? err.message : 'Unknown error'
setError(msg)
throw new Error(msg)
} finally {
setIsLoading(false)
}
},
[session, nrlProfile],
)

return { sendQuery, isLoading, lastResponse, error }
}
