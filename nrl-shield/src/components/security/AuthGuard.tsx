import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

interface AuthGuardProps {
children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
const { isAuthenticated, isLoading } = useAuth()

if (isLoading) {
return (
<div className="flex items-center justify-center min-h-screen bg-gray-950">
<Spinner size="lg" />
</div>
)
}

if (!isAuthenticated) {
return <Navigate to="/login" replace />
}

return <>{children}</>
}
