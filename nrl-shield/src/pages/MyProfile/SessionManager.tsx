import { useState } from 'react'
import { Monitor, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../config/supabase'
import { toast } from '../../components/ui/Toast'
import type { SessionInfo } from '../../types/auth.types'

interface SessionManagerProps {
  sessions?: SessionInfo[]
}

export default function SessionManager({ sessions: initialSessions = [] }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>(initialSessions)
  const [revoking, setRevoking] = useState<string | null>(null)

  const handleRevoke = async (session: SessionInfo) => {
    if (!window.confirm('Revoke this session? The device will be logged out.')) return
    setRevoking(session.id)
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_revoked: true })
        .eq('id', session.id)
      if (error) throw error
      setSessions((prev) => prev.filter((s) => s.id !== session.id))
      toast.success('Session revoked successfully.')
    } catch {
      toast.error('Failed to revoke session.')
    } finally {
      setRevoking(null)
    }
  }

  return (
    <Card title="Active Sessions">
      {sessions.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-6">No active sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Device / UA', 'IP Address', 'Created', 'Last Active', ''].map((h) => (
                  <th key={h} className="text-left text-xs text-white/40 font-mono uppercase tracking-widest pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/3 transition">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Monitor size={14} className="text-white/30 shrink-0" />
                      <span className="text-white/70 text-xs font-mono truncate max-w-[200px]">
                        {session.userAgent ? session.userAgent.slice(0, 40) + '…' : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs font-mono text-white/50">{session.ipAddress ?? '—'}</td>
                  <td className="py-3 pr-4 text-xs font-mono text-white/50">{new Date(session.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-xs font-mono text-white/50">{new Date(session.lastActive).toLocaleDateString()}</td>
                  <td className="py-3">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={revoking === session.id}
                      disabled={revoking === session.id || session.isRevoked}
                      onClick={() => handleRevoke(session)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={11} />
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
