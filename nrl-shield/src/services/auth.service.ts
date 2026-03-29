import { authenticator } from 'otplib'
import { supabase } from '../config/supabase'
import type { AppUser } from '../types/auth.types'

export interface LoginInput {
	email: string
	password: string
	mfaCode?: string
}

export interface SignupInput {
	email: string
	password: string
	fullName: string
	department: string
}

export interface AuthResult {
	user: AppUser
	accessToken: string
	refreshToken: string
}

function mapUser(supabaseUser: {
	id: string
	email?: string
	user_metadata?: Record<string, unknown>
	app_metadata?: Record<string, unknown>
}): AppUser {
	const metadata = supabaseUser.user_metadata ?? {}
	const level = typeof metadata.level === 'number' ? metadata.level : Number(metadata.level)
	const needTags = Array.isArray(metadata.need_tags)
		? metadata.need_tags.filter((value): value is string => typeof value === 'string')
		: []

	return {
		id: supabaseUser.id,
		email: supabaseUser.email ?? '',
		fullName: (metadata.full_name as string) ?? null,
		department: (metadata.department as string) ?? null,
		roleName: (metadata.role as string) ?? null,
		level: Number.isFinite(level) ? level : null,
		needTags,
		isActive: true,
		isMfaEnabled: Array.isArray(supabaseUser.app_metadata?.factors) && (supabaseUser.app_metadata?.factors as unknown[]).length > 0,
	}
}

function validateMfaCode(code?: string): void {
	if (!code) return

	if (!code.match(new RegExp(`^\\d{${authenticator.options.digits ?? 6}}$`))) {
		throw new Error('Invalid TOTP code format')
	}

	const secret = import.meta.env.VITE_DEMO_TOTP_SECRET
	if (secret && !authenticator.check(code, secret)) {
		throw new Error('Invalid MFA code')
	}
}

export async function login(email: string, password: string): Promise<AppUser>
export async function login(input: LoginInput): Promise<AuthResult>
export async function login(emailOrInput: string | LoginInput, maybePassword?: string): Promise<AppUser | AuthResult> {
	const input: LoginInput =
		typeof emailOrInput === 'string'
			? { email: emailOrInput, password: maybePassword ?? '' }
			: emailOrInput

	validateMfaCode(input.mfaCode)

	const { data, error } = await supabase.auth.signInWithPassword({
		email: input.email,
		password: input.password,
	})

	if (error || !data.user) {
		throw new Error(error?.message ?? 'Login failed')
	}

	const mapped = mapUser(data.user)

	if (typeof emailOrInput === 'string') {
		return mapped
	}

	if (!data.session) {
		throw new Error('Login did not return a session')
	}

	return {
		user: mapped,
		accessToken: data.session.access_token,
		refreshToken: data.session.refresh_token,
	}
}

export async function signup(input: SignupInput): Promise<AuthResult> {
	const { data, error } = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: {
			data: {
				full_name: input.fullName,
				department: input.department,
				role: 'ANALYST',
				level: 2,
				need_tags: ['GENERAL', 'OPERATIONAL'],
			},
		},
	})

	if (error || !data.user || !data.session) {
		throw new Error(error?.message ?? 'Sign up failed. Please verify your email before signing in.')
	}

	return {
		user: mapUser(data.user),
		accessToken: data.session.access_token,
		refreshToken: data.session.refresh_token,
	}
}

export async function logout(): Promise<void> {
	const { error } = await supabase.auth.signOut()
	if (error) throw error
}

export async function getCurrentUser(): Promise<AppUser | null> {
	const { data, error } = await supabase.auth.getUser()
	if (error || !data.user) return null
	return mapUser(data.user)
}

export async function verifyMfa(code: string): Promise<boolean> {
	validateMfaCode(code)

	const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
	if (factorsError || !factorsData?.totp?.length) {
		throw new Error('MFA is not configured for this account')
	}

	const factor = factorsData.totp[0]
	const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
	if (challengeError || !challengeData) throw challengeError

	const { error: verifyError } = await supabase.auth.mfa.verify({
		factorId: factor.id,
		challengeId: challengeData.id,
		code,
	})

	if (verifyError) throw verifyError
	return true
}

export async function refreshSession() {
	const { data, error } = await supabase.auth.refreshSession()
	if (error) throw error
	return data.session
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
	const session = await refreshSession()
	if (!session) return null
	return {
		accessToken: session.access_token,
		refreshToken: session.refresh_token,
	}
}

export async function getSession() {
	const { data, error } = await supabase.auth.getSession()
	if (error) throw error
	return data.session
}
