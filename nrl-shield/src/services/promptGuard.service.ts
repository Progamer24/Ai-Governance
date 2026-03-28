import type { PromptGuardResult } from '../types/ai.types'
import { RISK_THRESHOLD } from '../utils/constants'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

const LOCAL_BLOCK_PATTERNS: RegExp[] = [
/ignore\s+(all\s+)?previous\s+instructions/i,
/act\s+as\s+(a\s+|an\s+)?(different|new|evil|unfiltered)/i,
/\bDAN\b/,
/pretend\s+(you\s+are|to\s+be)/i,
/jailbreak/i,
/bypass\s+(your\s+)?(safety|filter|restriction)/i,
/forget\s+(your\s+)?(previous\s+)?(instructions|training|rules)/i,
/do\s+anything\s+now/i,
/(###|---|```\s*system)/,
]

export function quickCheck(query: string): boolean {
void RISK_THRESHOLD
return LOCAL_BLOCK_PATTERNS.some((p) => p.test(query))
}

export async function checkPrompt(
query: string,
accessToken: string,
): Promise<PromptGuardResult> {
if (quickCheck(query)) {
return {
isSafe: false,
score: 0.95,
reason: 'Local pattern match: potential prompt injection',
category: 'PATTERN',
}
}

const response = await fetch(`${SUPABASE_URL}/functions/v1/prompt-guard`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${accessToken}`,
},
body: JSON.stringify({ query }),
})

if (!response.ok) {
// Fail-safe: block on network error
return {
isSafe: false,
score: 0.5,
reason: `Prompt guard unavailable (${response.status})`,
category: 'ERROR',
}
}

return response.json() as Promise<PromptGuardResult>
}
