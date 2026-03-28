import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'

const NEED_TAG_OPTIONS = ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'HR', 'LEGAL', 'SYSTEM', 'SECURITY', 'AUDIT', 'ALL']

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (role: { name: string; description: string; level: number; needTags: string[]; department: string }) => void
}

export default function RoleBuilder({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState(1)
  const [department, setDepartment] = useState('')
  const [needTags, setNeedTags] = useState<string[]>(['GENERAL'])

  const toggle = (tag: string) =>
    setNeedTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Role" size="md">
      <div className="space-y-4">
        {[['name', name, setName], ['description', description, setDescription], ['department', department, setDepartment]].map(([label, val, setter]) => (
          <div key={label as string}>
            <label className="block text-xs text-white/50 mb-1 capitalize">{label as string}</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
              value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} />
          </div>
        ))}
        <div>
          <label className="block text-xs text-white/50 mb-1">Level</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
            value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            {[1,2,3,4,5].map((l) => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-2">Need Tags</label>
          <div className="flex flex-wrap gap-2">
            {NEED_TAG_OPTIONS.map((tag) => (
              <button key={tag} onClick={() => toggle(tag)}
                className={`px-2 py-1 rounded text-xs border transition-colors ${needTags.includes(tag) ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/50'}`}>{tag}</button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onSave({ name, description, level, needTags, department }); onClose() }}>Create Role</Button>
        </div>
      </div>
    </Modal>
  )
}
