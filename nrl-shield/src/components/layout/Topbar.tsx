import { useState, useRef, useEffect } from 'react'
import { Bell, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNRL } from '../../hooks/useNRL'

interface TopbarProps {
  onMenuClick?: () => void
  title?: string
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, logout } = useAuth()
  const { nrlProfile } = useNRL()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  const nrlBadgeParts = nrlProfile
    ? [
        `LEVEL ${nrlProfile.level}`,
        nrlProfile.roleId ? `ROLE ${nrlProfile.roleId.slice(0, 6).toUpperCase()}` : undefined,
        nrlProfile.needTags.length > 0 ? nrlProfile.needTags[0] : undefined,
      ].filter((v): v is string => Boolean(v))
    : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  return (
    <header className="fixed top-0 right-0 left-0 h-14 bg-navy/80 backdrop-blur border-b border-white/10 z-30 flex items-center px-4 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}
        {title && (
          <span className="text-white font-semibold text-sm truncate">{title}</span>
        )}
      </div>

      {/* Center: NRL badge */}
      {nrlBadgeParts.length > 0 && (
        <div className="hidden md:flex items-center">
          <span className="text-xs font-mono text-cyan border border-cyan/30 bg-cyan/5 rounded-full px-3 py-1">
            {nrlBadgeParts.join(' | ')}
          </span>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <button
          className="text-white/50 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-cyan/20 text-cyan text-xs font-bold flex items-center justify-center hover:bg-cyan/30 transition-colors"
            aria-label="User menu"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d1a2d] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-white/10">
                <p className="text-white/80 text-xs truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
