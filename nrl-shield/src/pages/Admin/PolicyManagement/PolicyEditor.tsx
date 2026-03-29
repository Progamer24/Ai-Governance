import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import type { PolicyDefinition } from '../../../hooks/useAdmin'

type DraftPolicy = Omit<PolicyDefinition, 'id' | 'createdAt'>

interface PolicyEditorProps {
  policy: PolicyDefinition | null
  isOpen: boolean
  onClose: () => void
  onSave: (policy: DraftPolicy) => void
}

export default function PolicyEditor({ policy, isOpen, onClose, onSave }: PolicyEditorProps) {
  const [name, setName] = useState(policy?.name ?? '')
  const [description, setDescription] = useState(policy?.description ?? '')
  const [severity, setSeverity] = useState<PolicyDefinition['severity']>(policy?.severity ?? 'MEDIUM')
  const [threshold, setThreshold] = useState(policy?.threshold ?? 50)
  const [enabled, setEnabled] = useState(policy?.enabled ?? true)
  const [roles, setRoles] = useState(policy?.appliesToRoles.join(', ') ?? 'ANALYST')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={policy ? 'Edit Policy' : 'Create Policy'} size="md">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-white/50">Policy Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/50">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as PolicyDefinition['severity'])} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/50">Risk Threshold</label>
            <input type="number" min={1} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Applies To Roles (comma separated)</label>
          <input value={roles} onChange={(e) => setRoles(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-cyan" />
          Enabled
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSave({
              name,
              description,
              severity,
              threshold,
              enabled,
              appliesToRoles: roles.split(',').map((r) => r.trim()).filter(Boolean),
            })}
          >
            Save Policy
          </Button>
        </div>
      </div>
    </Modal>
  )
}
