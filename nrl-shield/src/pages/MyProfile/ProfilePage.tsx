import { useAuth } from '../../hooks/useAuth'
import { useNRL } from '../../hooks/useNRL'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SessionManager from './SessionManager'

function Initials({ name, email }: { name: string | null; email: string }) {
  const src = name ?? email
  return (src.slice(0, 2).toUpperCase())
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { level, needTags, nrlProfile } = useNRL()

  if (!user) {
    return (
      <PageWrapper title="My Profile">
        <p className="text-white/40">Loading profile…</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="My Profile">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-2xl font-bold font-mono shrink-0">
              <Initials name={user.fullName} email={user.email} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{user.fullName ?? 'Unknown User'}</h2>
              <p className="text-white/50 text-sm font-mono">{user.email}</p>
              {user.department && (
                <p className="text-white/30 text-xs mt-0.5">{user.department}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">NRL Level</p>
              <Badge variant="info">Level {level}</Badge>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">MFA Status</p>
              {user.isMfaEnabled ? (
                <Badge variant="success">Enabled</Badge>
              ) : (
                <Badge variant="warning">Disabled</Badge>
              )}
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">Account Status</p>
              {user.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="danger">Inactive</Badge>
              )}
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">Active Since</p>
              <p className="text-white/70 text-sm font-mono">
                {nrlProfile?.validFrom ? new Date(nrlProfile.validFrom).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {needTags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">Need Tags</p>
              <div className="flex flex-wrap gap-2">
                {needTags.map((tag) => (
                  <Badge key={tag} variant="info">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <SessionManager />
      </div>
    </PageWrapper>
  )
}
