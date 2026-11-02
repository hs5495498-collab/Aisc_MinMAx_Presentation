import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { Card } from '@/components/ui/Card'
import { DemoLineChart } from '@/components/charts/DemoLineChart'
import { DemoDonutChart } from '@/components/charts/DemoDonutChart'
import { DemoDataNotice } from '@/components/feedback/DemoDataNotice'
import { insightRoutes } from '@/lib/routes'

const gamesPlayedTrend = [
  { name: 'Mon', value: 1 },
  { name: 'Tue', value: 3 },
  { name: 'Wed', value: 2 },
  { name: 'Thu', value: 4 },
  { name: 'Fri', value: 3 },
]

const winLoss = [
  { name: 'Wins', value: 8, color: '#2dd4bf' },
  { name: 'Losses', value: 3, color: '#f87171' },
  { name: 'Draws', value: 2, color: '#8b5cf6' },
]

export function PerformanceAnalyticsPage() {
  const route = insightRoutes[1]
  return (
    <PageContainer route={route}>
      <SectionSubNav items={insightRoutes} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Games Played (trend)">
          <DemoLineChart data={gamesPlayedTrend} />
          <DemoDataNotice className="mt-2" />
        </Card>
        <Card title="Win / Loss / Draw">
          <DemoDonutChart data={winLoss} />
          <DemoDataNotice className="mt-2" />
        </Card>
      </div>
      <Card title="Algorithm Execution Metrics" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-text-tertiary">
                <th className="py-2">Algorithm</th>
                <th className="py-2">Avg. nodes</th>
                <th className="py-2">Avg. time (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-card-border text-text-secondary">
              <tr>
                <td className="py-2">Minimax</td>
                <td className="py-2">5,478</td>
                <td className="py-2">11.2</td>
              </tr>
              <tr>
                <td className="py-2">Alpha-Beta (ordered)</td>
                <td className="py-2">892</td>
                <td className="py-2">2.1</td>
              </tr>
            </tbody>
          </table>
        </div>
        <DemoDataNotice className="mt-3" />
      </Card>
    </PageContainer>
  )
}
