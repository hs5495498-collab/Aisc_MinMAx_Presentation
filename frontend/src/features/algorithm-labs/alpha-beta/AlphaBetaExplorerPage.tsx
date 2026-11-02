import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { GraphWorkspace } from '@/components/graph/GraphWorkspace'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { labRoutes } from '@/lib/routes'

export function AlphaBetaExplorerPage() {
  const route = labRoutes[1]
  const [ordered, setOrdered] = useState(true)

  return (
    <PageContainer route={route} actions={<Badge tone="warning">Illustrative placeholder — no real pruning runs yet</Badge>}>
      <SectionSubNav items={labRoutes} />
      <GraphWorkspace
        illustrative
        toolbarExtra={
          <Tooltip label="Switches which heuristic ordering the real engine will use once implemented (Phase 6).">
            <div className="flex items-center gap-2 rounded-sm border border-graph-grid px-2 py-1.5 text-xs text-text-tertiary">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="ordering"
                  checked={ordered}
                  onChange={() => setOrdered(true)}
                />
                Ordered
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="ordering"
                  checked={!ordered}
                  onChange={() => setOrdered(false)}
                />
                Unordered
              </label>
            </div>
          </Tooltip>
        }
        configPanel={
          <div className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-text-tertiary">Position</label>
              <select disabled className="w-full rounded-sm border border-graph-grid bg-transparent px-2 py-1.5 text-text-tertiary">
                <option>Current Tic-Tac-Toe board</option>
              </select>
            </div>
            <p className="text-text-tertiary">Enabled once the Alpha-Beta engine ships in Phase 6.</p>
          </div>
        }
        nodeDetail={
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-text-tertiary">Alpha</dt><dd>—</dd></div>
            <div className="flex justify-between"><dt className="text-text-tertiary">Beta</dt><dd>—</dd></div>
            <div className="flex justify-between"><dt className="text-text-tertiary">Prune reason</dt><dd>—</dd></div>
          </dl>
        }
        stats={
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-text-tertiary">Nodes visited</dt><dd>—</dd></div>
            <div className="flex justify-between"><dt className="text-text-tertiary">Nodes pruned</dt><dd>—</dd></div>
          </dl>
        }
      />
      <section className="mt-6 rounded-lg border border-surface-card-border bg-surface-card p-5 text-sm text-text-secondary">
        <h2 className="mb-2 font-display text-base font-semibold text-text-primary">Pruned-node legend</h2>
        <p>
          Pruned branches render greyed out with a dashed, hatched outline — never by color alone.
          The <strong>Ordered</strong> vs <strong>Unordered</strong> toggle above will, once the real
          engine exists, visibly change how many nodes get pruned for the same position.
        </p>
      </section>
    </PageContainer>
  )
}
