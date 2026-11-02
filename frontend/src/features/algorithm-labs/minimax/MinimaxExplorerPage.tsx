import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { GraphWorkspace } from '@/components/graph/GraphWorkspace'
import { Badge } from '@/components/ui/Badge'
import { labRoutes } from '@/lib/routes'

export function MinimaxExplorerPage() {
  const route = labRoutes[0]
  return (
    <PageContainer route={route} actions={<Badge tone="warning">Illustrative placeholder — no real search runs yet</Badge>}>
      <SectionSubNav items={labRoutes} />
      <GraphWorkspace
        illustrative
        configPanel={
          <div className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-text-tertiary">Position</label>
              <select disabled className="w-full rounded-sm border border-graph-grid bg-transparent px-2 py-1.5 text-text-tertiary">
                <option>Current Tic-Tac-Toe board</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-text-tertiary">Depth cap</label>
              <select disabled className="w-full rounded-sm border border-graph-grid bg-transparent px-2 py-1.5 text-text-tertiary">
                <option>Full</option>
              </select>
            </div>
            <p className="text-text-tertiary">Enabled once the Minimax engine ships in Phase 5.</p>
          </div>
        }
        nodeDetail={<p className="text-text-tertiary">Select a node once a real search is loaded.</p>}
        stats={
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-text-tertiary">Nodes visited</dt>
              <dd>—</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-tertiary">Nodes pruned</dt>
              <dd>0 (Minimax never prunes)</dd>
            </div>
          </dl>
        }
      />
      <section className="mt-6 rounded-lg border border-surface-card-border bg-surface-card p-5 text-sm text-text-secondary">
        <h2 className="mb-2 font-display text-base font-semibold text-text-primary">How to read this workspace</h2>
        <p>
          Minimax explores the entire remaining game tree: MAX nodes (cyan) pick the highest-value
          child, MIN nodes (purple) pick the lowest. Unlike Alpha-Beta, Minimax never prunes — every
          reachable node gets visited. This explorer will replay a real, recorded search once the
          engine is implemented in Phase 5; right now it shows the workspace layout only.
        </p>
      </section>
    </PageContainer>
  )
}
