export const APP_NAME = 'NRL Shield'

export const RISK_THRESHOLD = {
	ALERT: 70,
	BLOCK: 90,
} as const

export const LEVEL_LABELS: Record<number, string> = {
	1: 'PUBLIC',
	2: 'INTERNAL',
	3: 'CONFIDENTIAL',
	4: 'RESTRICTED',
	5: 'TOP_SECRET',
}
