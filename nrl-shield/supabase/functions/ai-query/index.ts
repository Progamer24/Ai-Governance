import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function hexToBytes(hex: string): Uint8Array {
	const pairs = hex.match(/.{1,2}/g)
	if (!pairs) throw new Error('Invalid ENCRYPTION_KEY')
	return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)))
}

async function encryptText(value: string, keyHex: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['encrypt'])
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value))
	const out = new Uint8Array(iv.length + encrypted.byteLength)
	out.set(iv, 0)
	out.set(new Uint8Array(encrypted), iv.length)
	return btoa(String.fromCharCode(...out))
}

async function sha256(input: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
	return Array.from(new Uint8Array(digest)).map((v) => v.toString(16).padStart(2, '0')).join('')
}

function applyNrlResponseFilter(response: string, level: number): { response: string; wasFiltered: boolean; filterReason: string | null } {
	const restrictedTerms = level >= 5 ? [] : ['salary', 'social security', 'merger', 'acquisition', 'board minutes']
	let filtered = response
	let hit = false

	for (const term of restrictedTerms) {
		const re = new RegExp(term, 'ig')
		if (re.test(filtered)) {
			hit = true
			filtered = filtered.replace(re, '[REDACTED]')
		}
	}

	return {
		response: hit
			? `${filtered}\n\nSome content was restricted based on your current access level.`
			: filtered,
		wasFiltered: hit,
		filterReason: hit ? 'NRL_RESPONSE_FILTER' : null,
	}
}

async function callOpenAI(prompt: string): Promise<{ text: string; tokens: number }> {
	const apiKey = Deno.env.get('OPENAI_API_KEY')
	if (!apiKey) throw new Error('OPENAI_API_KEY missing')

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.2,
		}),
	})

	if (!response.ok) {
		throw new Error(`OpenAI error ${response.status}`)
	}

	const data = await response.json()
	return {
		text: data.choices?.[0]?.message?.content ?? '',
		tokens: Number(data.usage?.total_tokens ?? 0),
	}
}

async function callHuggingFace(prompt: string): Promise<{ text: string; tokens: number }> {
	const apiKey = Deno.env.get('HUGGINGFACE_API_KEY')
	if (!apiKey) throw new Error('HUGGINGFACE_API_KEY missing')

	const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ inputs: prompt }),
	})

	if (!response.ok) {
		throw new Error(`HuggingFace error ${response.status}`)
	}

	const data = await response.json()
	const text = Array.isArray(data) ? (data[0]?.generated_text ?? '') : ''
	return { text, tokens: Math.ceil(text.length / 4) }
}

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	const startedAt = Date.now()

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')
		const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
		const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
		const encryptionKey = Deno.env.get('ENCRYPTION_KEY')

		if (!supabaseUrl || !anonKey || !serviceRoleKey || !encryptionKey) {
			throw new Error('Missing required environment variables')
		}

		const authHeader = req.headers.get('Authorization')
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const jwt = authHeader.replace('Bearer ', '')
		const userClient = createClient(supabaseUrl, anonKey, {
			global: { headers: { Authorization: authHeader } },
		})

		const { data: authData, error: authError } = await userClient.auth.getUser(jwt)
		if (authError || !authData.user) {
			return new Response(JSON.stringify({ error: 'Invalid user token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const userId = authData.user.id
		const { query, session_token } = await req.json()
		if (!query || typeof query !== 'string' || !session_token) {
			return new Response(JSON.stringify({ error: 'Invalid payload' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const serviceClient = createClient(supabaseUrl, serviceRoleKey)

		const { data: nrlProfile, error: nrlError } = await serviceClient
			.from('nrl_profiles')
			.select('id, level, need_tags, role_id, is_active')
			.eq('user_id', userId)
			.eq('is_active', true)
			.order('updated_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		if (nrlError || !nrlProfile) {
			return new Response(JSON.stringify({ error: 'No active NRL profile found' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const promptGuardResponse = await fetch(`${supabaseUrl}/functions/v1/prompt-guard`, {
			method: 'POST',
			headers: {
				Authorization: authHeader,
				apikey: anonKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		})
		const promptGuard = await promptGuardResponse.json()

		if (!promptGuard.isSafe) {
			return new Response(
				JSON.stringify({
					response: 'I cannot assist with that based on your current access level.',
					was_filtered: false,
					filter_reason: null,
					risk_score: 95,
					model_used: 'BLOCKED_PROMPT_GUARD',
					nrl_context: nrlProfile,
				}),
				{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			)
		}

		const systemScopedPrompt =
			`You are an AI assistant for NRL Shield. The user has Level ${nrlProfile.level} access with need tags ${JSON.stringify(nrlProfile.need_tags)}. ` +
			'Only discuss topics within these boundaries. Never reveal information above this level. ' +
			"If asked about restricted topics, say: 'I cannot assist with that based on your current access level.'" +
			`\n\nUser Query: ${query}`

		let modelUsed = 'gpt-4o'
		let modelResponse: { text: string; tokens: number }
		try {
			modelResponse = await callOpenAI(systemScopedPrompt)
		} catch {
			modelUsed = 'mistralai/Mistral-7B-Instruct-v0.2'
			modelResponse = await callHuggingFace(systemScopedPrompt)
		}

		const filtered = applyNrlResponseFilter(modelResponse.text, Number(nrlProfile.level))

		const riskResponse = await fetch(`${supabaseUrl}/functions/v1/risk-score`, {
			method: 'POST',
			headers: {
				Authorization: authHeader,
				apikey: anonKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: userId,
				query,
				prompt_guard_score: Number(promptGuard.score ?? 0),
				hour_of_day: new Date().getHours(),
				queries_last_hour: 1,
			}),
		})
		const riskData = await riskResponse.json()

		const encryptedQuery = await encryptText(query, encryptionKey)
		const encryptedResponse = await encryptText(filtered.response, encryptionKey)
		const queryHash = await sha256(query)
		const responseTime = Date.now() - startedAt

		const anomalyFlagged = Number(riskData.score ?? 0) > 70

		const { error: insertError } = await serviceClient.from('ai_queries').insert({
			user_id: userId,
			session_id: String(session_token),
			query_encrypted: encryptedQuery,
			query_hash: queryHash,
			response_encrypted: encryptedResponse,
			prompt_guard_score: Number(promptGuard.score ?? 0),
			risk_score: Number(riskData.score ?? 0),
			nrl_context: {
				profile_id: nrlProfile.id,
				level: nrlProfile.level,
				need_tags: nrlProfile.need_tags,
			},
			model_used: modelUsed,
			tokens_used: modelResponse.tokens,
			response_time_ms: responseTime,
			was_filtered: filtered.wasFiltered,
			filter_reason: filtered.filterReason,
			anomaly_flagged: anomalyFlagged,
		})

		if (insertError) {
			throw insertError
		}

		await fetch(`${supabaseUrl}/functions/v1/audit-writer`, {
			method: 'POST',
			headers: {
				Authorization: authHeader,
				apikey: anonKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				event_type: filtered.wasFiltered ? 'RESPONSE_FILTERED' : 'QUERY_SENT',
				actor_id: userId,
				target_id: null,
				target_type: 'AI_QUERY',
				payload: {
					model_used: modelUsed,
					risk_score: Number(riskData.score ?? 0),
					was_filtered: filtered.wasFiltered,
					filter_reason: filtered.filterReason,
				},
				session_id: String(session_token),
				severity: Number(riskData.score ?? 0) > 90 ? 'CRITICAL' : Number(riskData.score ?? 0) > 70 ? 'HIGH' : 'LOW',
			}),
		})

		return new Response(
			JSON.stringify({
				response: filtered.response,
				was_filtered: filtered.wasFiltered,
				filter_reason: filtered.filterReason,
				risk_score: Number(riskData.score ?? 0),
				model_used: modelUsed,
				nrl_context: {
					level: nrlProfile.level,
					need_tags: nrlProfile.need_tags,
				},
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
