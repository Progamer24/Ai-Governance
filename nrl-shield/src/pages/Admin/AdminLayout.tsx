import { NavLink, Outlet } from 'react-router-dom'
import { Shield, Users, Key, FileText, AlertTriangle, BarChart2, Settings, PlugZap } from 'lucide-react'
import { useNRL } from '../../hooks/useNRL'
import Card from '../../components/ui/Card'

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: Shield, end: true },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/roles', label: 'Role Management', icon: Key },
  { to: '/admin/policies', label: 'Policy Management', icon: FileText },
  { to: '/admin/threats', label: 'Threat Monitor', icon: AlertTriangle },
  { to: '/admin/connectors', label: 'Data Connectors', icon: PlugZap },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { level, needTags } = useNRL()

  const isAdmin =
    (level >= 3 && (needTags.includes('SYSTEM') || needTags.includes('SECURITY'))) || level === 5

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full text-center p-8">
          <Shield className="w-16 h-16 text-crimson mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60">You do not have permission to access the Admin section.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-56 shrink-0 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col py-6 gap-1">
        <div className="px-4 mb-4">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Admin Console</span>
        </div>
        {navLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
