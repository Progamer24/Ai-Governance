import type { AIResponse } from '../types/ai.types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export async function sendQuery(
query: string,
sessionToken: string,
accessToken: string,
): Promise<AIResponse> {
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-query`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${accessToken}`,
},
body: JSON.stringify({ query, sessionToken }),
})

if (!response.ok) {
const err = await response.text()
throw new Error(`AI query failed (${response.status}): ${err}`)
}

return response.json() as Promise<AIResponse>
}
