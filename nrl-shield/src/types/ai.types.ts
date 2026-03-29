export interface AIQueryInput {
	query: string
	sessionToken: string
}

export interface PromptGuardResult {
	isSafe: boolean
	score: number
	reason: string
	category: string
}

export interface AIResponse {
	response: string
	wasFiltered: boolean
	filterReason: string | null
	riskScore: number
	modelUsed: string
	nrlContext: Record<string, unknown>
	tcsScore?: number
	trustTier?: 'ELEVATED' | 'HIGH' | 'STRICT'
	attestationVerified?: boolean
	receiptId?: string | null
}
