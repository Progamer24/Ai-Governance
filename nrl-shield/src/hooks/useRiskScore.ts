import { useState, useCallback } from 'react'
import { getRiskLevel } from '../services/riskScoring.service'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export function useRiskScore() {
const [riskScore, setRiskScore] = useState(0)

const updateScore = useCallback((score: number) => {
setRiskScore(Math.max(0, Math.min(100, score)))
}, [])

const riskLevel: RiskLevel = getRiskLevel(riskScore)

return { riskScore, riskLevel, updateScore }
}
