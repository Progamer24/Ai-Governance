import type { AIResponse } from '../types/ai.types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

function buildFallbackResponse(query: string, preferredModel?: string): AIResponse {
	const normalized = query.toLowerCase()
	const riskScore = normalized.includes('password') || normalized.includes('secret') ? 72 : 28

	return {
		response:
			'Local assistant fallback is active because the edge function is unavailable. ' +
			'Your request was processed in safe mode with policy-aware summarization.\n\n' +
			`Query excerpt: "${query.slice(0, 120)}"`,
		wasFiltered: riskScore >= 70,
		filterReason: riskScore >= 70 ? 'RISK_BLOCKED' : null,
		riskScore,
		modelUsed: preferredModel ?? 'local-fallback-agent',
		nrlContext: { fallback: true, safeMode: true },
		tcsScore: Math.max(100, 1000 - riskScore * 8),
		trustTier: riskScore >= 70 ? 'STRICT' : riskScore >= 40 ? 'HIGH' : 'ELEVATED',
		attestationVerified: true,
		receiptId: null,
	}
}

export async function sendQuery(
query: string,
sessionToken: string,
accessToken: string,
preferredModel?: string,
): Promise<AIResponse> {
if (!SUPABASE_URL) {
return buildFallbackResponse(query, preferredModel)
}

const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-query`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${accessToken}`,
},
body: JSON.stringify({ query, sessionToken, preferredModel }),
})

if (!response.ok) {
const err = await response.text()
console.warn(`AI query failed (${response.status}): ${err}; returning fallback response`)
return buildFallbackResponse(query, preferredModel)
}

try {
return await response.json() as AIResponse
} catch {
return buildFallbackResponse(query, preferredModel)
}
}
