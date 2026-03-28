import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const blockPatterns = [
	/ignore\s+previous\s+instructions/i,
	/act\s+as\s+/i,
	/\bDAN\b/i,
	/pretend\s+you\s+are/i,
	/your\s+true\s+self/i,
	/```\s*system/i,
	/prompt\s+leak/i,
]

function detectBase64(text: string): string[] {
	const matches = text.match(/(?:[A-Za-z0-9+/]{24,}={0,2})/g)
	return matches ?? []
}

function maybeDecodeBase64(value: string): string {
	try {
		return atob(value)
	} catch {
		return ''
	}
}

async function classifyWithHF(query: string): Promise<{ label: string; score: number } | null> {
	const apiKey = Deno.env.get('HUGGINGFACE_API_KEY')
	if (!apiKey) return null

	const response = await fetch(
		'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				inputs: query,
				parameters: {
					candidate_labels: ['SAFE', 'SUSPICIOUS', 'MALICIOUS'],
				},
			}),
		},
	)

	if (!response.ok) return null
	const data = await response.json()
	if (!Array.isArray(data?.labels) || !Array.isArray(data?.scores)) return null
	return { label: data.labels[0], score: Number(data.scores[0] ?? 0) }
}

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const { query } = await req.json()
		if (!query || typeof query !== 'string') {
			return new Response(JSON.stringify({ error: 'Invalid query' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		for (const pattern of blockPatterns) {
			if (pattern.test(query)) {
				return new Response(
					JSON.stringify({ isSafe: false, score: 0.95, reason: 'Matched blocked injection pattern', category: 'PATTERN' }),
					{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
				)
			}
		}

		const repeatedBoundary = /(###|---|```system)/g.test(query)
		if (repeatedBoundary) {
			return new Response(
				JSON.stringify({ isSafe: false, score: 0.8, reason: 'Boundary probing sequence detected', category: 'BOUNDARY' }),
				{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			)
		}

		const base64Tokens = detectBase64(query)
		for (const token of base64Tokens) {
			const decoded = maybeDecodeBase64(token)
			if (decoded && blockPatterns.some((pattern) => pattern.test(decoded))) {
				return new Response(
					JSON.stringify({ isSafe: false, score: 0.9, reason: 'Encoded jailbreak sequence detected', category: 'ENCODED' }),
					{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
				)
			}
		}

		const hfResult = await classifyWithHF(query)
		if (hfResult?.label === 'MALICIOUS') {
			return new Response(
				JSON.stringify({ isSafe: false, score: hfResult.score, reason: 'Semantic classifier marked as malicious', category: 'SEMANTIC' }),
				{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			)
		}

		const suspicious = hfResult?.label === 'SUSPICIOUS'
		return new Response(
			JSON.stringify({
				isSafe: !suspicious,
				score: suspicious ? hfResult?.score ?? 0.55 : 0.1,
				reason: suspicious ? 'Potentially suspicious intent' : 'Query passed prompt guard',
				category: suspicious ? 'SEMANTIC' : 'SAFE',
			}),
			{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		)
	} catch (error) {
		return new Response(JSON.stringify({ error: String(error) }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}
})
