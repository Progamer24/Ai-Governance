export interface JWTPayload {
	sub: string
	email?: string
	exp: number
	iat: number
	role?: string
	[key: string]: unknown
}

export function decodeJwtPayload(token: string): JWTPayload {
	const [, payload] = token.split('.')
	if (!payload) throw new Error('Invalid JWT')
	return JSON.parse(atob(payload)) as JWTPayload
}
