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

async function encryptJSON(payload: unknown, keyHex: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['encrypt'])
	const data = new TextEncoder().encode(JSON.stringify(payload))
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

	const out = new Uint8Array(iv.length + encrypted.byteLength)
	out.set(iv, 0)
	out.set(new Uint8Array(encrypted), iv.length)
	return btoa(String.fromCharCode(...out))
}

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')
		const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
		const encryptionKey = Deno.env.get('ENCRYPTION_KEY')

		if (!supabaseUrl || !serviceRoleKey || !encryptionKey) {
			throw new Error('Missing required environment variables')
		}

		const { event_type, actor_id, target_id = null, target_type = null, payload, severity = 'LOW', ip_address = null, user_agent = null, session_id = null } = await req.json()

		const payloadEncrypted = await encryptJSON(payload ?? {}, encryptionKey)
		const supabase = createClient(supabaseUrl, serviceRoleKey)

		const { data, error } = await supabase
			.from('audit_logs')
			.insert({
				event_type,
				actor_id,
				target_id,
				target_type,
				payload_encrypted: { cipher: payloadEncrypted },
				ip_address,
				user_agent,
				session_id,
				severity,
			})
			.select('id, created_at')
			.single()

		if (error) throw error

		return new Response(JSON.stringify(data), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (error) {
		return new Response(JSON.stringify({ error: String(error) }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}
})
