import { useEffect, useState } from 'react'
import PageWrapper from '../../../components/layout/PageWrapper'
import SearchBar from '../../../components/ui/SearchBar'
import Button from '../../../components/ui/Button'
import UserTable from './UserTable'
import UserForm from './UserForm'
import type { UserFormPayload } from './UserForm'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { useAdmin } from '../../../hooks/useAdmin'
import { useNRL } from '../../../hooks/useNRL'

interface UserRecord {
  id: string
  email: string
  full_name: string | null
  department: string | null
  is_active: boolean
  is_mfa_enabled: boolean
  nrl_level?: number
  nrl_role_id?: string
}

export default function UsersPage() {
  const { fetchUsers, lockUser, unlockUser, createUser, updateUser, deleteUser, isLoading } = useAdmin()
  const { level } = useNRL()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRecord | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const canManage = level >= 5

  useEffect(() => {
    fetchUsers().then(setUsers)
  }, [fetchUsers])

  const filtered = users.filter(
    (u) =>
      (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleLockToggle = async (id: string, isActive: boolean) => {
    if (!canManage) return
    if (isActive) await lockUser(id)
    else await unlockUser(id)
    fetchUsers().then(setUsers)
  }

  const handleSaveUser = async (payload: UserFormPayload) => {
    if (!canManage) return

    if (payload.id) {
      await updateUser(payload.id, {
        email: payload.email,
        full_name: payload.full_name,
        department: payload.department,
        is_active: payload.is_active,
        is_mfa_enabled: payload.is_mfa_enabled,
        nrl_level: payload.nrl_level,
        nrl_need_tags: payload.nrl_need_tags,
        nrl_role_id: payload.nrl_role_id,
      })
    } else {
      await createUser({
        id: crypto.randomUUID(),
        email: payload.email,
        full_name: payload.full_name,
        department: payload.department,
        is_active: payload.is_active,
        is_mfa_enabled: payload.is_mfa_enabled,
        nrl_level: payload.nrl_level,
        nrl_need_tags: payload.nrl_need_tags,
        nrl_role_id: payload.nrl_role_id,
      })
    }

    setFormOpen(false)
    fetchUsers().then(setUsers)
  }

  const handleDelete = async () => {
    if (!canManage || !deleteId) return
    await deleteUser(deleteId)
    setDeleteId(null)
    fetchUsers().then(setUsers)
  }

  return (
    <PageWrapper title="User Management">
      <div className="flex items-center justify-between mb-6 gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users…" className="flex-1 max-w-sm" />
        {canManage ? (
          <Button variant="primary" onClick={() => { setEditUser(undefined); setFormOpen(true) }}>+ Add User</Button>
        ) : (
          <span className="text-xs text-amber">Level 5 required for user management actions.</span>
        )}
      </div>
      <UserTable
        users={filtered}
        isLoading={isLoading}
        onEdit={(u) => { if (canManage) { setEditUser(u as UserRecord); setFormOpen(true) } }}
        onDelete={(id) => { if (canManage) setDeleteId(id) }}
        onLock={(id, active) => handleLockToggle(id, active)}
      />
      <UserForm
        user={editUser}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveUser}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
      />
    </PageWrapper>
  )
}
