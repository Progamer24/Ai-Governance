import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { ROLE_BASELINE } from '../../../config/rbac.config'
import NRLMatrix from './NRLMatrix'

export default function RolesPage() {
  const roles = Object.entries(ROLE_BASELINE)
  return (
    <PageWrapper title="Role Management">
      <div className="mb-6">
        <NRLMatrix />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map(([name, def]) => (
          <Card key={name} title={name}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Level:</span>
                <Badge variant="info">L{def.level}</Badge>
              </div>
              <div>
                <span className="text-xs text-white/50 block mb-1">Need Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {def.needs.map((n) => (
                    <span key={n} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded px-2 py-0.5 font-mono">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageWrapper>
  )
}
