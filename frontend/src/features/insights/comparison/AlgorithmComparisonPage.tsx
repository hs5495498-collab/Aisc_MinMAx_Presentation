import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { Card } from '@/components/ui/Card'
import { DemoBarChart } from '@/components/charts/DemoBarChart'
import { DemoDataNotice } from '@/components/feedback/DemoDataNotice'
import { insightRoutes } from '@/lib/routes'

const nodesVisited = [
  { name: 'Minimax', value: 5478 },
  { name: 'Alpha-Beta (unordered)', value: 2114 },
  { name: 'Alpha-Beta (ordered)', value: 892 },
]

const executionTime = [
  { name: 'Minimax', value: 11.2 },
  { name: 'Alpha-Beta (unordered)', value: 4.6 },
  { name: 'Alpha-Beta (ordered)', value: 2.1 },
]

export function AlgorithmComparisonPage() {
  const route = insightRoutes[0]
  return (
    <PageContainer route={route}>
      <SectionSubNav items={insightRoutes} />

      <div className="mb-4 rounded-md border border-accent-cyan/30 bg-accent-cyan/5 p-4 text-sm text-text-secondary">
        <p>
          <strong className="text-text-primary">Methodology:</strong> once implemented, every run
          compared here will use the same fixed set of Tic-Tac-Toe positions at full search depth,
          so these charts are directly comparable to <em>each other</em> only. They are never
          comparable to Rock Paper Scissors metrics, which use a different mathematical model (game
          theory, not search) — see docs/GAME_THEORY_DESIGN.md.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Nodes Visited">
          <DemoBarChart data={nodesVisited} color="#8b5cf6" />
          <DemoDataNotice className="mt-2" />
        </Card>
        <Card title="Execution Time (ms)">
          <DemoBarChart data={executionTime} color="#22d3ee" />
          <DemoDataNotice className="mt-2" />
        </Card>
      </div>
    </PageContainer>
  )
}
