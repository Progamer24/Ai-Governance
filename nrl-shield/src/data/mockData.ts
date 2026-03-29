import type { UserProfile, AnomalyRecord, PolicyDefinition, RoleDefinition, PipelineEvent } from '../hooks/useAdmin'
import type { AuditLogRecord } from '../types/audit.types'

export const mockUsers: UserProfile[] = [
  {
    id: 'u-admin',
    email: 'admin@nrl.example',
    full_name: 'Alex Admin',
    department: 'Security',
    is_active: true,
    is_mfa_enabled: true,
    nrl_level: 5,
    nrl_need_tags: ['ALL'],
    nrl_role_id: 'SUPERADMIN',
  },
  {
    id: 'u-mgr',
    email: 'manager@nrl.example',
    full_name: 'Morgan Manager',
    department: 'Operations',
    is_active: true,
    is_mfa_enabled: true,
    nrl_level: 4,
    nrl_need_tags: ['OPERATIONAL', 'FINANCIAL'],
    nrl_role_id: 'DIRECTOR',
  },
  {
    id: 'u-analyst',
    email: 'analyst@nrl.example',
    full_name: 'Ari Analyst',
    department: 'Research',
    is_active: true,
    is_mfa_enabled: false,
    nrl_level: 2,
    nrl_need_tags: ['GENERAL', 'OPERATIONAL'],
    nrl_role_id: 'ANALYST',
  },
]

export const mockAnomalies: AnomalyRecord[] = [
  {
    id: 'an-1',
    user_id: 'u-analyst',
    anomaly_type: 'Prompt Injection Pattern',
    risk_score: 84,
    detected_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: 'OPEN',
    metadata: { source: 'prompt_guard', category: 'injection', confidence: 0.89 },
  },
  {
    id: 'an-2',
    user_id: 'u-mgr',
    anomaly_type: 'NRL Boundary Drift',
    risk_score: 57,
    detected_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    status: 'OPEN',
    metadata: { source: 'policy_engine', category: 'boundary', confidence: 0.62 },
  },
  {
    id: 'an-3',
    user_id: 'u-admin',
    anomaly_type: 'Excessive Query Burst',
    risk_score: 33,
    detected_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    status: 'RESOLVED',
    metadata: { source: 'rate_limiter', category: 'usage', confidence: 0.71 },
  },
]

export const mockRoles: RoleDefinition[] = [
  {
    id: 'r-superadmin',
    name: 'SUPERADMIN',
    description: 'Global control for governance platform operations',
    level: 5,
    department: 'Security',
    needTags: ['ALL'],
  },
  {
    id: 'r-director',
    name: 'DIRECTOR',
    description: 'Department oversight and sensitive AI review',
    level: 4,
    department: 'Operations',
    needTags: ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'HR'],
  },
  {
    id: 'r-analyst',
    name: 'ANALYST',
    description: 'Operational research and reporting',
    level: 2,
    department: 'Research',
    needTags: ['GENERAL', 'OPERATIONAL'],
  },
]

export const mockPolicies: PolicyDefinition[] = [
  {
    id: 'p-risk-block',
    name: 'High Risk Auto-Block',
    description: 'Block responses when risk score exceeds threshold',
    severity: 'HIGH',
    threshold: 75,
    enabled: true,
    appliesToRoles: ['ANALYST', 'DIRECTOR'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'p-pii-redact',
    name: 'PII Redaction',
    description: 'Redact sensitive identifiers for non-L5 users',
    severity: 'MEDIUM',
    threshold: 45,
    enabled: true,
    appliesToRoles: ['ANALYST', 'MANAGER', 'DIRECTOR'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export const mockPipelineEvents: PipelineEvent[] = [
  {
    id: 'pipe-1',
    stage: 'INGEST',
    status: 'SUCCESS',
    latencyMs: 81,
    message: 'Prompt accepted and normalized',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'pipe-2',
    stage: 'GUARD',
    status: 'SUCCESS',
    latencyMs: 45,
    message: 'Prompt guard score below block threshold',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'pipe-3',
    stage: 'NRL',
    status: 'WARNING',
    latencyMs: 36,
    message: 'Need-tag mismatch removed one context chunk',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'pipe-4',
    stage: 'MODEL',
    status: 'SUCCESS',
    latencyMs: 210,
    message: 'Local fallback model served response',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
]

export const mockAuditLogs: AuditLogRecord[] = [
  {
    id: 'log-1',
    eventType: 'AI_QUERY',
    actorId: 'u-analyst',
    targetId: null,
    targetType: 'assistant',
    payloadEncrypted: '{"query":"summarize access trend"}',
    severity: 'LOW',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'log-2',
    eventType: 'POLICY_UPDATE',
    actorId: 'u-admin',
    targetId: 'p-risk-block',
    targetType: 'policy',
    payloadEncrypted: '{"enabled":true,"threshold":75}',
    severity: 'MEDIUM',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
]
