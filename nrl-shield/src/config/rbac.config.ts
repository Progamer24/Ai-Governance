export const ROLE_BASELINE = {
	INTERN: { level: 1, needs: ['GENERAL'] },
	ANALYST: { level: 2, needs: ['GENERAL', 'OPERATIONAL'] },
	MANAGER: { level: 3, needs: ['GENERAL', 'OPERATIONAL', 'FINANCIAL'] },
	DIRECTOR: { level: 4, needs: ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'HR', 'LEGAL'] },
	EXECUTIVE: { level: 5, needs: ['ALL'] },
	AUDITOR: { level: 2, needs: ['ALL'] },
	COMPLIANCE: { level: 3, needs: ['LEGAL', 'FINANCIAL', 'AUDIT'] },
	IT_ADMIN: { level: 3, needs: ['SYSTEM', 'SECURITY'] },
	SUPERADMIN: { level: 5, needs: ['ALL'] },
} as const
