import { useState } from 'react'
import { Settings2, BarChart3, MousePointerClick, Workflow } from 'lucide-react'
import { GraphPanel } from '@/components/ui/GraphPanel'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { BottomSheet } from '@/components/layout/BottomSheet'
import type { UseSearchTreeExplorerReturn } from '@/hooks/useSearchTreeExplorer'
import { SearchTreeCanvas } from './SearchTreeCanvas'
import { PlaybackControls } from './PlaybackControls'
import { SearchConfigPanel } from './SearchConfigPanel'
import { AlgorithmStatsPanel } from './AlgorithmStatsPanel'
import { NodeInspectorPanel } from './NodeInspectorPanel'
import { SearchTreeLegend } from './SearchTreeLegend'
import { explainEvent } from '@/lib/searchTreeExplain'

interface SearchTreeExplorerViewProps {
  explorer: UseSearchTreeExplorerReturn
  runLabel: string
  hidePositionAndRun?: boolean
}

export function SearchTreeExplorerView({ explorer, runLabel, hidePositionAndRun = false }: SearchTreeExplorerViewProps) {
  const [mobileSheet, setMobileSheet] = useState<'config' | 'stats' | 'inspector' | null>(null)
  const activeNodeId = explorer.playback.state.openStack[explorer.playback.state.openStack.length - 1] ?? null

  const configPanel = (
    <SearchConfigPanel
      positionId={explorer.positionId}
      onPositionChange={explorer.setPositionId}
      onRun={explorer.run}
      loading={explorer.loading}
      depthFilter={explorer.depthFilter}
      onDepthFilterChange={explorer.setDepthFilter}
      nodeCap={explorer.nodeCap}
      onNodeCapChange={explorer.setNodeCap}
      runLabel={runLabel}
      hidePositionAndRun={hidePositionAndRun}
    />
  )

  const statsPanel = explorer.fixture ? (
    <AlgorithmStatsPanel
      statistics={explorer.fixture.statistics}
      selection={explorer.selection}
      revealedCount={Object.keys(explorer.playback.state.revealedNodes).length}
    />
  ) : (
    <p className="text-text-tertiary">Run a search to see statistics.</p>
  )

  const inspectorPanel = <NodeInspectorPanel node={explorer.selectedNode} />

  return (
    <div>
      {/* Mobile toolbar: open config/stats/inspector as bottom sheets */}
      <div className="mb-3 flex gap-2 lg:hidden">
        <MobileSheetButton icon={Settings2} label="Config" onClick={() => setMobileSheet('config')} />
        <MobileSheetButton icon={BarChart3} label="Stats" onClick={() => setMobileSheet('stats')} />
        <MobileSheetButton icon={MousePointerClick} label="Node" onClick={() => setMobileSheet('inspector')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_260px]">
        <div className="hidden lg:block">
          <GraphPanel title="Configuration">{configPanel}</GraphPanel>
        </div>

        <div className="space-y-3">
          {explorer.error ? (
            <ErrorState message={explorer.error} onRetry={explorer.run} />
          ) : !explorer.fixture ? (
            <EmptyState
              icon={Workflow}
              title="No search run yet"
              message={
                hidePositionAndRun
                  ? 'Use the shared Run Comparison button above — nothing runs automatically.'
                  : 'Pick a position on the left and press Run to replay a real recorded search — nothing runs automatically.'
              }
            />
          ) : explorer.loading ? (
            <GraphPanel>
              <LoadingSkeleton rows={4} />
            </GraphPanel>
          ) : (
            <>
              <SearchTreeCanvas
                layout={explorer.layout}
                selectedNodeId={explorer.selectedNodeId}
                activeNodeId={activeNodeId}
                onSelectNode={explorer.setSelectedNodeId}
                hiddenCount={explorer.selection.hiddenByDepthFilter + explorer.selection.hiddenByWindow}
              />
              <PlaybackControls playback={explorer.playback} />
              <p className="rounded-sm border border-graph-grid bg-graph-bg/60 p-2 font-mono text-xs text-text-secondary">
                {explainEvent(explorer.playback.state.lastEvent)}
              </p>
            </>
          )}
        </div>

        <div className="hidden space-y-4 lg:block">
          <GraphPanel title="Node Detail">{inspectorPanel}</GraphPanel>
          <GraphPanel title="Search Statistics">{statsPanel}</GraphPanel>
          <GraphPanel title="Legend">
            <SearchTreeLegend />
          </GraphPanel>
        </div>
      </div>

      <BottomSheet open={mobileSheet === 'config'} onClose={() => setMobileSheet(null)} title="Configuration">
        {configPanel}
      </BottomSheet>
      <BottomSheet open={mobileSheet === 'stats'} onClose={() => setMobileSheet(null)} title="Search Statistics">
        {statsPanel}
      </BottomSheet>
      <BottomSheet open={mobileSheet === 'inspector'} onClose={() => setMobileSheet(null)} title="Node Detail">
        {inspectorPanel}
      </BottomSheet>
    </div>
  )
}

function MobileSheetButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Settings2
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-graph-grid py-2 text-xs text-text-secondary"
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
