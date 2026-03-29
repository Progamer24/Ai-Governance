import { useEffect, useState } from 'react'
import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import NRLMatrix from './NRLMatrix'
import RoleBuilder from './RoleBuilder'
import { useAdmin, type RoleDefinition } from '../../../hooks/useAdmin'
import { useNRL } from '../../../hooks/useNRL'

export default function RolesPage() {
  const { roles, fetchRoles, updateRole, createRole } = useAdmin()
  const { level } = useNRL()
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const canManageRoles = level >= 5

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  const bumpRoleLevel = (role: RoleDefinition, delta: number) => {
    if (!canManageRoles) return
    const next = Math.max(1, Math.min(5, role.level + delta))
    updateRole(role.id, { level: next })
  }

  return (
    <PageWrapper title="Role Management">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-white/50">Level 5 can create roles and adjust levels.</span>
        {canManageRoles ? (
          <Button variant="primary" size="sm" onClick={() => setIsBuilderOpen(true)}>
            + Add Role
          </Button>
        ) : null}
      </div>

      <div className="mb-6">
        <NRLMatrix />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} title={role.name}>
            <div className="space-y-2">
              <p className="text-xs text-white/50">{role.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Level:</span>
                <Badge variant="info">L{role.level}</Badge>
                {canManageRoles ? (
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => bumpRoleLevel(role, -1)} className="rounded border border-white/10 px-1 text-white/60 hover:text-white">-</button>
                    <button onClick={() => bumpRoleLevel(role, 1)} className="rounded border border-white/10 px-1 text-white/60 hover:text-white">+</button>
                  </div>
                ) : null}
              </div>
              <div>
                <span className="text-xs text-white/50 block mb-1">Need Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {role.needTags.map((n) => (
                    <span key={n} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded px-2 py-0.5 font-mono">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <RoleBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSave={(role) => createRole(role)}
      />
    </PageWrapper>
  )
}
