import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { GraphPanel } from '@/components/ui/GraphPanel'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { ExecutionToolbar } from '@/components/graph/ExecutionToolbar'
import { NodeLegend } from '@/components/graph/NodeLegend'
import { Badge } from '@/components/ui/Badge'
import { labRoutes } from '@/lib/routes'

export function SearchTreeLabPage() {
  const route = labRoutes[2]
  return (
    <PageContainer route={route} actions={<Badge tone="warning">Illustrative placeholder — both panes show the same demo tree</Badge>}>
      <SectionSubNav items={labRoutes} />

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-center font-display text-sm font-semibold text-accent-cyan">Minimax</p>
          <GraphCanvas illustrative />
        </div>
        <div className="space-y-2">
          <p className="text-center font-display text-sm font-semibold text-graph-node-min">Alpha-Beta (ordered)</p>
          <GraphCanvas illustrative />
        </div>
      </div>

      <div className="mb-4">
        <ExecutionToolbar />
        <p className="mt-2 text-xs text-text-tertiary">
          A single shared step control will drive both panes in sync once the real engine exists —
          see docs/PAGE_WIREFRAMES.md.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GraphPanel title="Value propagation & pruning log">
          <p className="text-text-tertiary">
            Once connected to a real search, this log will narrate MAX/MIN value propagation, alpha/beta
            updates, and the exact node-count delta between Minimax and Alpha-Beta on this position.
          </p>
        </GraphPanel>
        <GraphPanel title="Legend">
          <NodeLegend />
        </GraphPanel>
      </div>
    </PageContainer>
  )
}
