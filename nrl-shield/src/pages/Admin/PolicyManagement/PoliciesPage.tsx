import { useEffect, useState } from 'react'
import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { useAdmin, type PolicyDefinition } from '../../../hooks/useAdmin'
import { useNRL } from '../../../hooks/useNRL'
import PolicyEditor from './PolicyEditor'

export default function PoliciesPage() {
  const { policies, fetchPolicies, updatePolicy, createPolicy } = useAdmin()
  const { level } = useNRL()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editing, setEditing] = useState<PolicyDefinition | null>(null)
  const canManagePolicies = level >= 5

  useEffect(() => {
    void fetchPolicies()
  }, [fetchPolicies])

  return (
    <PageWrapper title="Policy Management">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-white/50">Define risk controls, filtering thresholds, and role scopes.</span>
        {canManagePolicies ? (
          <Button variant="primary" size="sm" onClick={() => { setEditing(null); setIsEditorOpen(true) }}>
            + Add Policy
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {policies.map((policy) => (
          <Card key={policy.id} title={policy.name}>
            <div className="space-y-2">
              <p className="text-sm text-white/70">{policy.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={policy.severity === 'CRITICAL' ? 'danger' : policy.severity === 'HIGH' ? 'warning' : 'info'}>
                  {policy.severity}
                </Badge>
                <Badge variant="default">Threshold {policy.threshold}</Badge>
                <Badge variant={policy.enabled ? 'success' : 'warning'}>{policy.enabled ? 'Enabled' : 'Disabled'}</Badge>
              </div>
              <p className="text-xs text-white/50">Applies to: {policy.appliesToRoles.join(', ')}</p>
              {canManagePolicies ? (
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => { setEditing(policy); setIsEditorOpen(true) }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => updatePolicy(policy.id, { enabled: !policy.enabled })}>
                    {policy.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <PolicyEditor
        key={`${editing?.id ?? 'new'}-${isEditorOpen ? 'open' : 'closed'}`}
        policy={editing}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(next) => {
          if (editing) {
            updatePolicy(editing.id, next)
          } else {
            createPolicy(next)
          }
          setIsEditorOpen(false)
        }}
      />
    </PageWrapper>
  )
}
