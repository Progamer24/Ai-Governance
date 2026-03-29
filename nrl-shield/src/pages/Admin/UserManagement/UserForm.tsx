import { useEffect, useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'

interface UserRecord {
  id?: string
  email: string
  full_name: string | null
  department: string | null
  is_active: boolean
  is_mfa_enabled: boolean
  nrl_level?: number
  nrl_role_id?: string
}

export type UserFormPayload = UserRecord & {
  nrl_need_tags: string[]
  nrl_role_id: string | undefined
}

const NEED_TAG_OPTIONS = ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'HR', 'LEGAL', 'SYSTEM', 'SECURITY', 'AUDIT', 'ALL']

interface Props {
  user?: UserRecord
  isOpen: boolean
  onClose: () => void
  onSave: (payload: UserFormPayload) => Promise<void> | void
}

export default function UserForm({ user, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState<UserRecord>({
    email: '', full_name: '', department: '', is_active: true, is_mfa_enabled: false, nrl_level: 1, nrl_role_id: 'ANALYST',
  })
  const [needTags, setNeedTags] = useState<string[]>(['GENERAL'])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(user)
      setNeedTags(user.id ? [] : ['GENERAL'])
    } else {
      setForm({ email: '', full_name: '', department: '', is_active: true, is_mfa_enabled: false, nrl_level: 1, nrl_role_id: 'ANALYST' })
      setNeedTags(['GENERAL'])
    }
  }, [user, isOpen])

  const toggle = (tag: string) =>
    setNeedTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        ...form,
        nrl_need_tags: needTags,
        nrl_role_id: form.nrl_role_id,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user?.id ? 'Edit User' : 'Add User'} size="md">
      <div className="space-y-4">
        {['email', 'full_name', 'department', 'nrl_role_id'].map((field) => (
          <div key={field}>
            <label className="block text-xs text-white/50 mb-1 capitalize">{field.replace('_', ' ')}</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
              value={(form[field as keyof UserRecord] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              disabled={field === 'email' && !!user?.id}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-white/50 mb-1">NRL Level</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
            value={form.nrl_level ?? 1}
            onChange={(e) => setForm((f) => ({ ...f, nrl_level: Number(e.target.value) }))}
          >
            {[1,2,3,4,5].map((l) => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-2">Need Tags</label>
          <div className="flex flex-wrap gap-2">
            {NEED_TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={`px-2 py-1 rounded text-xs border transition-colors ${needTags.includes(tag) ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/50'}`}
              >{tag}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-cyan-500" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={form.is_mfa_enabled} onChange={(e) => setForm((f) => ({ ...f, is_mfa_enabled: e.target.checked }))} className="accent-cyan-500" />
            MFA Enabled
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
