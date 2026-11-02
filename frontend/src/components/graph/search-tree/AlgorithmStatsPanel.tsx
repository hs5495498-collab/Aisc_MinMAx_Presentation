import type { SearchTreeStatistics } from '@/types/searchTree'
import type { RenderSelection } from '@/lib/searchTreeLayout'

interface AlgorithmStatsPanelProps {
  statistics: SearchTreeStatistics
  selection: RenderSelection
  revealedCount: number
}

/** Always shows the real, complete search statistics first — the
 * "currently rendered" count is a clearly separate, clearly-labeled
 * row, never conflated with the total (Phase 7 brief §5/§7). */
export function AlgorithmStatsPanel({ statistics, selection, revealedCount }: AlgorithmStatsPanelProps) {
  const totalInSearch = statistics.nodes_visited + (statistics.branches_pruned ?? 0)
  const rendered = selection.renderedIds.size

  return (
    <dl className="space-y-1.5 text-xs">
      <Row label="Nodes visited (real)" value={statistics.nodes_visited.toLocaleString()} />
      <Row label="Terminal nodes" value={statistics.terminal_nodes.toLocaleString()} />
      <Row label="Max depth" value={String(statistics.maximum_search_depth)} />
      {statistics.alpha_beta_cutoffs !== undefined && (
        <Row label="Cutoffs" value={statistics.alpha_beta_cutoffs.toLocaleString()} />
      )}
      {statistics.branches_pruned !== undefined && (
        <Row label="Branches pruned" value={statistics.branches_pruned.toLocaleString()} />
      )}
      <Row label="Execution time" value={`${statistics.execution_time_ms.toFixed(2)} ms`} />
      <div className="my-2 border-t border-graph-grid" />
      <Row label="Total nodes in this search" value={totalInSearch.toLocaleString()} />
      <Row label="Revealed so far (playback)" value={revealedCount.toLocaleString()} />
      <Row label="Currently rendered" value={rendered.toLocaleString()} />
      {(selection.hiddenByDepthFilter > 0 || selection.hiddenByWindow > 0) && (
        <Row
          label="Hidden by filter"
          value={`${(selection.hiddenByDepthFilter + selection.hiddenByWindow).toLocaleString()}`}
        />
      )}
    </dl>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-mono text-text-primary">{value}</dd>
    </div>
  )
}
