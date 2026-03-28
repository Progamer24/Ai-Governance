export function clampRiskScore(value: number): number {
	if (value < 0) return 0
	if (value > 100) return 100
	return Math.round(value)
}

export function isOffHours(hour: number): boolean {
	return hour < 7 || hour > 20
}
