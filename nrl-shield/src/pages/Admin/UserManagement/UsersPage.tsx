import { useEffect, useState } from 'react'
import PageWrapper from '../../../components/layout/PageWrapper'
import SearchBar from '../../../components/ui/SearchBar'
import Button from '../../../components/ui/Button'
import UserTable from './UserTable'
import UserForm from './UserForm'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { useAdmin } from '../../../hooks/useAdmin'

interface UserRecord {
  id: string
  email: string
  full_name: string | null
  department: string | null
  is_active: boolean
  is_mfa_enabled: boolean
  nrl_level?: number
  role_id?: string
}

export default function UsersPage() {
  const { fetchUsers, lockUser, unlockUser, isLoading } = useAdmin()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRecord | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers().then(setUsers)
  }, [fetchUsers])

  const filtered = users.filter(
    (u) =>
      (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleLockToggle = async (id: string, isActive: boolean) => {
    if (isActive) await lockUser(id)
    else await unlockUser(id)
    fetchUsers().then(setUsers)
  }

  return (
    <PageWrapper title="User Management">
      <div className="flex items-center justify-between mb-6 gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users…" className="flex-1 max-w-sm" />
        <Button variant="primary" onClick={() => { setEditUser(undefined); setFormOpen(true) }}>+ Add User</Button>
      </div>
      <UserTable
        users={filtered}
        isLoading={isLoading}
        onEdit={(u) => { setEditUser(u as UserRecord); setFormOpen(true) }}
        onDelete={(id) => setDeleteId(id)}
        onLock={(id, active) => handleLockToggle(id, active)}
      />
      <UserForm
        user={editUser}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => { setFormOpen(false); fetchUsers().then(setUsers) }}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
      />
    </PageWrapper>
  )
}
