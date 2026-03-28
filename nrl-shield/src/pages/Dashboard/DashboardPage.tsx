import PageWrapper from '../../components/layout/PageWrapper'
import StatCards from './StatCards'
import RiskChart from './RiskChart'
import ActivityFeed from './ActivityFeed'

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-6">
        <StatCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RiskChart />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
