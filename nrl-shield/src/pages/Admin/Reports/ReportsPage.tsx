import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import { useAdmin } from '../../../hooks/useAdmin'
import ReportBuilder from './ReportBuilder'

export default function ReportsPage() {
  const { users, anomalies, policies } = useAdmin()

  return (
    <PageWrapper title="Reports">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-white/50 text-xs">Users Monitored</p>
            <p className="text-white text-2xl font-bold">{users.length}</p>
          </Card>
          <Card>
            <p className="text-white/50 text-xs">Open Threats</p>
            <p className="text-white text-2xl font-bold">{anomalies.filter((a) => a.status !== 'RESOLVED').length}</p>
          </Card>
          <Card>
            <p className="text-white/50 text-xs">Active Policies</p>
            <p className="text-white text-2xl font-bold">{policies.filter((p) => p.enabled).length}</p>
          </Card>
        </div>

        <ReportBuilder />
      </div>
    </PageWrapper>
  )
}
