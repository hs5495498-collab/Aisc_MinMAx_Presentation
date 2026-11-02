import type { SearchTreeFixture } from '@/types/searchTree'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatEvaluation } from '@/lib/searchTreeExplain'

/** All numbers here come directly from the two fixtures' own recorded
 * `statistics`/`bestMove` — nothing is recomputed or estimated. Time
 * is shown but never asserted as a guaranteed constant (Phase 7 brief
 * §7: "Do not compare timings as a guaranteed constant"). */
export function ComparisonSummary({
  minimax,
  alphaBeta,
}: {
  minimax: SearchTreeFixture
  alphaBeta: SearchTreeFixture
}) {
  const mmRoot = minimax.rootId ? minimax.nodes[minimax.rootId] : null
  const abRoot = alphaBeta.rootId ? alphaBeta.nodes[alphaBeta.rootId] : null
  const evaluationsMatch = mmRoot?.evaluation === abRoot?.evaluation
  const bestMovesMatch = minimax.bestMove.row === alphaBeta.bestMove.row && minimax.bestMove.col === alphaBeta.bestMove.col

  const mmNodes = minimax.statistics.nodes_visited
  const abNodes = alphaBeta.statistics.nodes_visited
  const nodeReduction = mmNodes > 0 ? ((mmNodes - abNodes) / mmNodes) * 100 : 0

  return (
    <Card title="Comparison Summary" className="mb-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={evaluationsMatch ? 'success' : 'error'}>
          Evaluations {evaluationsMatch ? 'match' : 'differ'}: Minimax {formatEvaluation(mmRoot?.evaluation)} / Alpha-Beta{' '}
          {formatEvaluation(abRoot?.evaluation)}
        </Badge>
        <Badge tone={bestMovesMatch ? 'success' : 'warning'}>
          Best move {bestMovesMatch ? 'matches' : 'differs'}: ({minimax.bestMove.row},{minimax.bestMove.col}) vs. (
          {alphaBeta.bestMove.row},{alphaBeta.bestMove.col})
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
        <Stat label="Minimax nodes" value={mmNodes.toLocaleString()} />
        <Stat label="Alpha-Beta nodes" value={abNodes.toLocaleString()} />
        <Stat label="Node reduction" value={`${nodeReduction.toFixed(1)}%`} />
        <Stat label="Branches pruned" value={(alphaBeta.statistics.branches_pruned ?? 0).toLocaleString()} />
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        Execution time ({minimax.statistics.execution_time_ms.toFixed(1)}ms vs.{' '}
        {alphaBeta.statistics.execution_time_ms.toFixed(1)}ms) is environment-dependent and shown for reference
        only — node counts above are the reliable comparison.
      </p>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-tertiary">{label}</p>
      <p className="font-display text-lg font-semibold text-text-primary">{value}</p>
    </div>
  )
}
