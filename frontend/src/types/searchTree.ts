/**
 * Mirrors backend/app/algorithms/visualization/models.py's to_dict()
 * output exactly. These are real recorded search events — see
 * docs/SEARCH_TREE_VISUALIZATION.md for how they get from a Python
 * solver run into frontend/src/data/search-trees/*.json.
 */

export type NodeRole = 'MAX' | 'MIN'
export type NodeStatus = 'visited' | 'evaluated' | 'completed' | 'pruned'
export type Algorithm = 'minimax' | 'alpha_beta'

export interface VisualMove {
  row: number
  col: number
}

export interface VisualNode {
  id: string
  parentId: string | null
  depth: number
  role: NodeRole | null
  board: string[] | null
  move: VisualMove | null
  status: NodeStatus
  evaluation: number | null
  alpha: number | null
  beta: number | null
  isTerminal: boolean
  terminalResult: string | null
  childrenIds: string[]
}

export type SearchEventType =
  | 'node_entered'
  | 'move_explored'
  | 'terminal_evaluated'
  | 'alpha_updated'
  | 'beta_updated'
  | 'cutoff_triggered'
  | 'branch_pruned'
  | 'value_returned'
  | 'best_move_updated'

export interface SearchEvent {
  index: number
  type: SearchEventType
  nodeId?: string | null
  parentId?: string | null
  depth?: number
  role?: NodeRole
  board?: string[]
  move?: VisualMove | null
  alpha?: number | null
  beta?: number | null
  value?: number
  oldAlpha?: number
  newAlpha?: number
  oldBeta?: number
  newBeta?: number
  reason?: string
}

export interface SearchTreeStatistics {
  nodes_visited: number
  terminal_nodes: number
  leaves_evaluated: number
  moves_considered: number
  maximum_search_depth: number
  execution_time_ms: number
  alpha_beta_cutoffs?: number
  branches_pruned?: number
}

export interface SearchTreeFixture {
  algorithm: Algorithm
  aiPlayer: string
  opponentPlayer: string
  positionLabel: string | null
  rootId: string | null
  nodes: Record<string, VisualNode>
  events: SearchEvent[]
  statistics: SearchTreeStatistics
  bestMove: VisualMove
  sizeTier?: 'small' | 'large'
  initialMoves?: VisualMove[]
}
