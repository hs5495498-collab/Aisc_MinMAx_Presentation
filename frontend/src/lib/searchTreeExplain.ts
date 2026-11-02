import type { SearchEvent, VisualNode } from '@/types/searchTree'

/** The solver's internal +/-infinity sentinels (see backend solver.py's
 * `_NEG_INF`/`_POS_INF`) formatted for humans instead of as raw integers. */
export function formatBound(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (value <= -999_000) return '-∞'
  if (value >= 999_000) return '+∞'
  return String(value)
}

export function formatEvaluation(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value > 0 ? `+${value}` : String(value)
}

/** A static, always-true-for-this-node explanation, independent of
 * which event most recently fired — used as the inspector's baseline
 * description. Only ever describes what the node's own recorded
 * fields actually say. */
export function explainNodeStatus(node: VisualNode): string {
  if (node.status === 'pruned') {
    return (
      'This branch was never explored. Alpha-Beta determined, from bounds already ' +
      'established elsewhere in the search, that the player above this node would ' +
      'never let play reach it — so it skipped evaluating it entirely.'
    )
  }
  if (node.isTerminal) {
    const result = node.terminalResult ?? 'the game ending'
    return `This is a terminal position (${result}). Its evaluation (${formatEvaluation(node.evaluation)}) was computed directly from the final board, not backed up from any children.`
  }
  if (node.role === 'MAX') {
    return node.status === 'completed'
      ? `This is a MAX node. It chose the highest value among its explored children: ${formatEvaluation(node.evaluation)}.`
      : 'This is a MAX node. The algorithm is choosing the move with the highest backed-up value among its children.'
  }
  if (node.role === 'MIN') {
    return node.status === 'completed'
      ? `This is a MIN node. It chose the lowest value among its explored children: ${formatEvaluation(node.evaluation)}.`
      : 'This is a MIN node. The algorithm is choosing the move with the lowest backed-up value among its children — modeling an opponent who minimizes the AI’s outcome.'
  }
  return 'This node has not been reached by the search yet.'
}

/** A one-line explanation of what the *most recent* event actually did,
 * for the "what just happened" line under the playback controls. */
export function explainEvent(event: SearchEvent | null): string {
  if (!event) return 'Press Play or Next to begin replaying the real recorded search.'
  switch (event.type) {
    case 'node_entered':
      return `Entered a new ${event.role ?? ''} node at depth ${event.depth} — board evaluated for the first time.`
    case 'move_explored':
      return `About to explore the move (${event.move?.row}, ${event.move?.col}).`
    case 'terminal_evaluated':
      return `Reached a terminal position — scored ${formatEvaluation(event.value)} directly from the final board.`
    case 'alpha_updated':
      return `Alpha increased from ${formatBound(event.oldAlpha)} to ${formatBound(event.newAlpha)} — a better guaranteed option was found for MAX.`
    case 'beta_updated':
      return `Beta decreased from ${formatBound(event.oldBeta)} to ${formatBound(event.newBeta)} — a better guaranteed option was found for MIN.`
    case 'cutoff_triggered':
      return `Cutoff: alpha (${formatBound(event.alpha)}) ≥ beta (${formatBound(event.beta)}) at this ${event.role ?? ''} node — the remaining siblings are skipped.`
    case 'branch_pruned':
      return `Branch skipped: the move (${event.move?.row}, ${event.move?.col}) was never evaluated because the cutoff condition was already satisfied.`
    case 'value_returned':
      return `Value ${formatEvaluation(event.value)} returned to the parent node.`
    case 'best_move_updated':
      return `Root's best move updated to (${event.move?.row}, ${event.move?.col}) with evaluation ${formatEvaluation(event.value)}.`
    default:
      return ''
  }
}
