import { useNRL } from '../../hooks/useNRL'

interface RoleGateProps {
children: React.ReactNode
requiredLevel?: number
requiredRole?: string
fallback?: React.ReactNode
}

export default function RoleGate({ children, requiredLevel, requiredRole, fallback = null }: RoleGateProps) {
const { nrlProfile, isLoading } = useNRL()

if (isLoading) return null

if (requiredLevel !== undefined && (!nrlProfile || nrlProfile.level < requiredLevel)) {
return <>{fallback}</>
}

if (requiredRole !== undefined && (!nrlProfile || nrlProfile.roleId !== requiredRole)) {
return <>{fallback}</>
}

return <>{children}</>
}
