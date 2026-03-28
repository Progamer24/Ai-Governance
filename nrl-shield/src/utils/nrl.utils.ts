export function canAccessTopic(userLevel: number, topicLevel: number, userNeeds: string[], topicNeed: string): boolean {
	return userLevel >= topicLevel && userNeeds.includes(topicNeed)
}

export function isAdminRole(roleName: string): boolean {
	return ['IT_ADMIN', 'SUPERADMIN'].includes(roleName)
}
