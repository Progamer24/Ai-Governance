import { clampRiskScore, isOffHours } from '../utils/riskScore.utils'

const SENSITIVE_KEYWORDS = [
'salary', 'payroll', 'merger', 'acquisition', 'lawsuit',
'confidential', 'secret', 'password', 'credential', 'exploit',
'hack', 'bypass', 'override', 'social security', 'tax file',
]

const BASELINE_QUERIES_PER_HOUR = 5

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface RiskParams {
promptGuardScore: number
query: string
hourOfDay: number
queriesLastHour: number
}

function topicSensitivityScore(query: string): number {
const lower = query.toLowerCase()
const hits = SENSITIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length
return Math.min(hits / 3, 1)
}

export function calculateRiskScore(params: RiskParams): number {
const { promptGuardScore, query, hourOfDay, queriesLastHour } = params

const topicSensitivity = topicSensitivityScore(query)
const offHours = isOffHours(hourOfDay) ? 1 : 0
const deviation = Math.max(0, queriesLastHour - BASELINE_QUERIES_PER_HOUR) / BASELINE_QUERIES_PER_HOUR
const rateSpike = queriesLastHour > BASELINE_QUERIES_PER_HOUR * 3 ? 1 : deviation

const raw =
promptGuardScore * 40 +
topicSensitivity * 20 +
offHours * 10 +
Math.min(deviation, 1) * 15 +
Math.min(rateSpike, 1) * 15

return clampRiskScore(raw)
}

export function getRiskLevel(score: number): RiskLevel {
if (score >= 80) return 'CRITICAL'
if (score >= 60) return 'HIGH'
if (score >= 30) return 'MEDIUM'
return 'LOW'
}
