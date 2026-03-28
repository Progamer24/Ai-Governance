import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Bot,
  ScrollText,
  User,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../../hooks/useAuth'
import { useNRL } from '../../hooks/useNRL'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/audit', label: 'Audit Logs', icon: ScrollText },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const { nrlProfile } = useNRL()

  const isAdmin =
    (user?.email?.includes('admin') ?? false) || ((nrlProfile?.level ?? 0) >= 4)

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 bg-navy border-r border-white/10 z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 min-h-[56px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck size={22} className="text-cyan shrink-0" />
          {!collapsed && (
            <span className="text-white font-bold text-sm whitespace-nowrap">NRL Shield</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-white/40 hover:text-white transition-colors shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-cyan border-l-2 border-cyan bg-cyan/5 pl-[10px]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && user && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/80 text-sm font-medium truncate">{user.email}</p>
          {nrlProfile && (
            <span className="inline-block mt-1 text-xs font-mono bg-cyan/10 text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
              NRL LVL {nrlProfile.level}
            </span>
          )}
        </div>
      )}
    </motion.aside>
  )
}
