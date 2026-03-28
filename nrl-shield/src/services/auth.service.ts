import { authenticator } from 'otplib'
import { supabase } from '../config/supabase'
import type { AppUser } from '../types/auth.types'

function mapUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): AppUser {
return {
id: supabaseUser.id,
email: supabaseUser.email ?? '',
fullName: (supabaseUser.user_metadata?.full_name as string) ?? null,
department: (supabaseUser.user_metadata?.department as string) ?? null,
isActive: true,
isMfaEnabled: Array.isArray(supabaseUser.app_metadata?.factors) && (supabaseUser.app_metadata.factors as unknown[]).length > 0,
}
}

export async function login(email: string, password: string): Promise<AppUser> {
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
if (error) throw error
if (!data.user) throw new Error('No user returned from login')
return mapUser(data.user)
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
// Validate TOTP code format before network round-trip (otplib digits default is 6)
if (!code.match(new RegExp(`^\\d{${authenticator.options.digits ?? 6}}$`))) {
throw new Error('Invalid TOTP code format')
}

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

export async function getSession() {
const { data, error } = await supabase.auth.getSession()
if (error) throw error
return data.session
}
