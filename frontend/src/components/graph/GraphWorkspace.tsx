import type { ReactNode } from 'react'
import { GraphPanel } from '@/components/ui/GraphPanel'
import { NodeLegend } from './NodeLegend'
import { ExecutionToolbar } from './ExecutionToolbar'
import { GraphCanvas } from './GraphCanvas'

interface GraphWorkspaceProps {
  configPanel: ReactNode
  nodeDetail: ReactNode
  stats: ReactNode
  toolbarExtra?: ReactNode
  illustrative?: boolean
}

/**
 * Shared 3-pane algorithm-lab workspace (config / canvas / node detail)
 * used by Minimax Explorer, Alpha-Beta Explorer, and (in a duplicated
 * pair) Search Tree Lab. On mobile, panes stack vertically rather than
 * using true bottom sheets — a Phase 3 simplification documented in
 * docs/FRONTEND_ARCHITECTURE.md, to be revisited in Phase 7.
 */
export function GraphWorkspace({ configPanel, nodeDetail, stats, toolbarExtra, illustrative }: GraphWorkspaceProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_260px]">
      <GraphPanel title="Configuration">{configPanel}</GraphPanel>

      <div className="space-y-3">
        <GraphCanvas illustrative={illustrative} />
        <ExecutionToolbar extra={toolbarExtra} />
      </div>

      <div className="space-y-4">
        <GraphPanel title="Node Detail">{nodeDetail}</GraphPanel>
        <GraphPanel title="Search Statistics">{stats}</GraphPanel>
        <GraphPanel title="Legend">
          <NodeLegend />
        </GraphPanel>
      </div>
    </div>
  )
}
