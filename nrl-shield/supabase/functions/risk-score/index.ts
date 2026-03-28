import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sensitiveKeywords = [
	'salary',
	'pii',
	'legal',
	'merger',
	'acquisition',
	'executive',
	'board',
	'payroll',
]

function clamp(value: number): number {
	return Math.max(0, Math.min(100, Math.round(value)))
}

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const { query, prompt_guard_score, hour_of_day, queries_last_hour, pattern_deviation_score = 0 } = await req.json()

		const safePromptScore = Number(prompt_guard_score ?? 0)
		const hour = Number(hour_of_day ?? new Date().getHours())
		const queryVolume = Number(queries_last_hour ?? 0)
		const deviation = Number(pattern_deviation_score ?? 0)

		const queryText = String(query ?? '').toLowerCase()
		const topicHitCount = sensitiveKeywords.filter((keyword) => queryText.includes(keyword)).length
		const topicSensitivityScore = Math.min(1, topicHitCount / 3)
		const isOffHours = hour < 7 || hour > 20
		const rateSpikeScore = Math.min(1, queryVolume / 10)

		const score = clamp(
			safePromptScore * 40 +
				topicSensitivityScore * 20 +
				(isOffHours ? 10 : 0) +
				Math.min(1, deviation) * 15 +
				rateSpikeScore * 15,
		)

		let anomalyType: string | undefined
		if (safePromptScore > 0.7) anomalyType = 'PROMPT_INJECTION'
		else if (isOffHours) anomalyType = 'OFF_HOURS_ACCESS'
		else if (rateSpikeScore > 0.8) anomalyType = 'RAPID_QUERYING'
		else if (topicSensitivityScore > 0.7) anomalyType = 'UNAUTHORIZED_TOPIC'

		return new Response(
			JSON.stringify({
				score,
				anomaly_type: score > 70 ? anomalyType ?? 'RISK_SPIKE' : null,
				should_block: score > 90,
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
