export interface SessionInfo {
	id: string
	userId: string
	jwtJti: string
	ipAddress: string | null
	userAgent: string | null
	createdAt: string
	lastActive: string
	expiresAt: string
	isRevoked: boolean
}

export interface AppUser {
	id: string
	email: string
	fullName: string | null
	department: string | null
	isActive: boolean
	isMfaEnabled: boolean
}

export interface AuthState {
	user: AppUser | null
	accessToken: string | null
	refreshToken: string | null
	sessions: SessionInfo[]
}
