import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Pencil, Trash2, Lock, Unlock } from 'lucide-react'

interface UserRecord {
  id: string
  email: string
  full_name: string | null
  department: string | null
  is_active: boolean
  nrl_level?: number
  role_id?: string
}

interface Props {
  users: UserRecord[]
  isLoading: boolean
  onEdit: (user: UserRecord) => void
  onDelete: (id: string) => void
  onLock: (id: string, isActive: boolean) => void
}

export default function UserTable({ users, isLoading, onEdit, onDelete, onLock }: Props) {
  if (isLoading) return <div className="text-white/50 font-mono p-4">Loading users…</div>
  if (!users.length) return <div className="text-white/40 font-mono p-4">No users found.</div>
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-white/80">
        <thead className="bg-white/5 text-white/50 uppercase text-xs tracking-wider">
          <tr>
            {['Name', 'Email', 'Dept', 'Level', 'Role', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-medium">{u.full_name ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-white/60">{u.email}</td>
              <td className="px-4 py-3 text-white/50">{u.department ?? '—'}</td>
              <td className="px-4 py-3">
                {u.nrl_level ? <Badge variant="info">L{u.nrl_level}</Badge> : '—'}
              </td>
              <td className="px-4 py-3 text-white/50 text-xs">{u.role_id ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Locked'}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(u)} className="text-white/40 hover:text-cyan transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => onLock(u.id, u.is_active)} className="text-white/40 hover:text-amber transition-colors">
                    {u.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button onClick={() => onDelete(u.id)} className="text-white/40 hover:text-crimson transition-colors"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Silence unused import warning
void Button
