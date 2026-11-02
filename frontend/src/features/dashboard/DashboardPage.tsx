import { Link } from 'react-router-dom'
import { ArrowRight, Swords, Dices, BookOpenCheck } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { Badge } from '@/components/ui/Badge'
import { DemoDataNotice } from '@/components/feedback/DemoDataNotice'
import { DemoDonutChart } from '@/components/charts/DemoDonutChart'
import { dashboardRoute, gameRoutes, labRoutes } from '@/lib/routes'

const winLossDemo = [
  { name: 'Wins', value: 8, color: '#2dd4bf' },
  { name: 'Losses', value: 3, color: '#f87171' },
  { name: 'Draws', value: 2, color: '#8b5cf6' },
]

const recentActivityDemo = [
  { label: 'Tic-Tac-Toe vs demo AI', detail: 'Result: Won · sample record' },
  { label: 'Rock Paper Scissors · Bo5', detail: '3–2 Won · sample record' },
  { label: 'Minimax Explorer opened', detail: 'Illustrative tree viewed · sample record' },
]

const learningProgressDemo = [
  { label: 'Minimax Tutorial', value: 0 },
  { label: 'Alpha-Beta Tutorial', value: 0 },
  { label: 'RPS Game Theory', value: 0 },
]

export function DashboardPage() {
  return (
    <PageContainer route={dashboardRoute}>
      <section className="mb-6 rounded-xl border border-surface-card-border bg-surface-card p-6">
        <h2 className="font-display text-xl font-semibold text-text-primary">Welcome back</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Pick up a game, explore how the algorithms behind it work, or continue a lesson.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { to: gameRoutes[0].path, label: 'Play Tic-Tac-Toe', icon: Swords },
            { to: gameRoutes[1].path, label: 'Play Rock Paper Scissors', icon: Dices },
            { to: '/learn/minimax', label: 'Continue learning', icon: BookOpenCheck },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-between gap-2 rounded-md border border-surface-card-border bg-black/10 px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent-magenta/40"
            >
              <span className="flex items-center gap-2">
                <item.icon size={16} className="text-accent-cyan" />
                {item.label}
              </span>
              <ArrowRight size={14} className="text-text-tertiary" />
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card title="Performance Summary">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-0">
            <DemoDonutChart data={winLossDemo} />
            <div className="flex flex-wrap gap-4 sm:mt-3">
              {winLossDemo.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>
          <DemoDataNotice className="mt-3" />
        </Card>

        <Card title="Algorithm Lab Shortcuts">
          <div className="grid grid-cols-2 gap-3">
            {labRoutes.map((lab) => (
              <Link
                key={lab.path}
                to={lab.path}
                className="flex flex-col items-start gap-2 rounded-md border border-surface-card-border p-3 text-xs font-medium text-text-secondary transition-colors hover:border-accent-violet/40 hover:text-text-primary"
              >
                <lab.icon size={18} className="text-accent-violet" />
                {lab.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Games played" value="13" tone="cyan" />
        <StatTile label="Current streak" value="3 wins" tone="teal" />
        <StatTile label="Lab runs" value="1" tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent Activity">
          <ul className="space-y-3">
            {recentActivityDemo.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-primary">{item.label}</span>
                <span className="text-xs text-text-tertiary">{item.detail}</span>
              </li>
            ))}
          </ul>
          <DemoDataNotice className="mt-4" />
        </Card>

        <Card title="Learning Progress">
          <ul className="space-y-4">
            {learningProgressDemo.map((item) => (
              <li key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                  <span>{item.label}</span>
                  <Badge tone="neutral">Not started</Badge>
                </div>
                <div className="h-1.5 w-full rounded-pill bg-white/10">
                  <div
                    className="h-full rounded-pill bg-accent-teal"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageContainer>
  )
}
