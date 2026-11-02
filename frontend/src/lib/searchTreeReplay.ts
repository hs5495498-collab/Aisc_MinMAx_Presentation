import type { SearchEvent, SearchTreeStatistics, VisualMove, VisualNode } from '@/types/searchTree'

/**
 * Pure event-replay reducer. Every function here only *applies* an
 * already-recorded event (see types/searchTree.ts) to a tree state —
 * nothing here invents a node, a value, or a pruning decision. This
 * is the "playback engine" the Phase 7 brief asks for: the displayed
 * tree is always a direct function of how many real events have been
 * replayed, never a separately-maintained or guessed structure.
 */
export interface ReplayState {
  revealedNodes: Record<string, VisualNode>
  /** Node ids currently "open" (entered but not yet returned) — the active path from root to the current frontier. */
  openStack: string[]
  rootId: string | null
  lastEvent: SearchEvent | null
  bestMoveSoFar: { move: VisualMove; score: number } | null
}

export const EMPTY_REPLAY_STATE: ReplayState = {
  revealedNodes: {},
  openStack: [],
  rootId: null,
  lastEvent: null,
  bestMoveSoFar: null,
}

function withChildAppended(
  nodes: Record<string, VisualNode>,
  parentId: string | null,
  childId: string,
): Record<string, VisualNode> {
  if (!parentId || !nodes[parentId]) return nodes
  return {
    ...nodes,
    [parentId]: { ...nodes[parentId], childrenIds: [...nodes[parentId].childrenIds, childId] },
  }
}

export function applyEvent(state: ReplayState, event: SearchEvent): ReplayState {
  switch (event.type) {
    case 'node_entered': {
      if (!event.nodeId) return { ...state, lastEvent: event }
      const node: VisualNode = {
        id: event.nodeId,
        parentId: event.parentId ?? null,
        depth: event.depth ?? 0,
        role: event.role ?? null,
        board: event.board ?? null,
        move: event.move ?? null,
        status: 'visited',
        evaluation: null,
        alpha: event.alpha ?? null,
        beta: event.beta ?? null,
        isTerminal: false,
        terminalResult: null,
        childrenIds: [],
      }
      let nodes = { ...state.revealedNodes, [node.id]: node }
      nodes = withChildAppended(nodes, node.parentId, node.id)
      return {
        ...state,
        revealedNodes: nodes,
        openStack: [...state.openStack, node.id],
        rootId: state.rootId ?? (node.parentId === null ? node.id : state.rootId),
        lastEvent: event,
      }
    }

    case 'terminal_evaluated': {
      const id = event.nodeId
      if (!id || !state.revealedNodes[id]) return { ...state, lastEvent: event }
      const existing = state.revealedNodes[id]
      return {
        ...state,
        revealedNodes: {
          ...state.revealedNodes,
          [id]: { ...existing, isTerminal: true, evaluation: event.value ?? null, status: 'evaluated' },
        },
        lastEvent: event,
      }
    }

    case 'alpha_updated': {
      const id = event.nodeId
      if (!id || !state.revealedNodes[id]) return { ...state, lastEvent: event }
      return {
        ...state,
        revealedNodes: { ...state.revealedNodes, [id]: { ...state.revealedNodes[id], alpha: event.newAlpha ?? null } },
        lastEvent: event,
      }
    }

    case 'beta_updated': {
      const id = event.nodeId
      if (!id || !state.revealedNodes[id]) return { ...state, lastEvent: event }
      return {
        ...state,
        revealedNodes: { ...state.revealedNodes, [id]: { ...state.revealedNodes[id], beta: event.newBeta ?? null } },
        lastEvent: event,
      }
    }

    case 'branch_pruned': {
      if (!event.nodeId) return { ...state, lastEvent: event }
      const node: VisualNode = {
        id: event.nodeId,
        parentId: event.parentId ?? null,
        depth: event.depth ?? 0,
        role: null,
        board: null, // never explored — no board/evaluation exists for a pruned branch
        move: event.move ?? null,
        status: 'pruned',
        evaluation: null,
        alpha: null,
        beta: null,
        isTerminal: false,
        terminalResult: null,
        childrenIds: [],
      }
      let nodes = { ...state.revealedNodes, [node.id]: node }
      nodes = withChildAppended(nodes, node.parentId, node.id)
      return { ...state, revealedNodes: nodes, lastEvent: event }
    }

    case 'value_returned': {
      const id = state.openStack[state.openStack.length - 1]
      if (!id || !state.revealedNodes[id]) return { ...state, lastEvent: event }
      const existing = state.revealedNodes[id]
      const updated: VisualNode =
        existing.status === 'evaluated'
          ? existing
          : { ...existing, evaluation: event.value ?? null, status: 'completed' }
      return {
        ...state,
        revealedNodes: { ...state.revealedNodes, [id]: updated },
        openStack: state.openStack.slice(0, -1),
        lastEvent: event,
      }
    }

    case 'best_move_updated': {
      if (!event.move || event.value === undefined) return { ...state, lastEvent: event }
      return { ...state, bestMoveSoFar: { move: event.move, score: event.value }, lastEvent: event }
    }

    // 'move_explored' and 'cutoff_triggered' carry useful context for the
    // timeline/explanation UI but don't themselves change any node's
    // recorded fields — only `lastEvent` advances.
    case 'move_explored':
    case 'cutoff_triggered':
    default:
      return { ...state, lastEvent: event }
  }
}

/** Replay events[0..targetIndex] from scratch. O(targetIndex) — used for
 * jumps/scrubs/"previous", not for every forward step (see the playback
 * hook, which applies single steps incrementally instead). */
export function buildStateAtIndex(events: SearchEvent[], targetIndex: number): ReplayState {
  if (targetIndex < 0) return EMPTY_REPLAY_STATE
  const end = Math.min(targetIndex, events.length - 1)
  let state = EMPTY_REPLAY_STATE
  for (let i = 0; i <= end; i++) {
    state = applyEvent(state, events[i])
  }
  return state
}

/** Node-count summary for the "total vs. rendered vs. filtered" requirement. */
export function summarizeCounts(
  state: ReplayState,
  renderedCount: number,
  statistics: SearchTreeStatistics,
): { revealed: number; rendered: number; totalInSearch: number } {
  return {
    revealed: Object.keys(state.revealedNodes).length,
    rendered: renderedCount,
    totalInSearch: statistics.nodes_visited + (statistics.branches_pruned ?? 0),
  }
}
