import { describe, expect, it } from 'vitest'
import { applyEvent, buildStateAtIndex, EMPTY_REPLAY_STATE } from './searchTreeReplay'
import type { SearchEvent } from '@/types/searchTree'

const EVENTS: SearchEvent[] = [
  { index: 0, type: 'node_entered', nodeId: 'n0', parentId: null, depth: 0, role: 'MAX', board: ['', '', '', '', '', '', '', '', ''], move: null },
  { index: 1, type: 'move_explored', nodeId: 'n0', depth: 0, move: { row: 0, col: 0 }, role: 'MAX' },
  { index: 2, type: 'node_entered', nodeId: 'n1', parentId: 'n0', depth: 1, role: 'MIN', board: ['X', '', '', '', '', '', '', '', ''], move: { row: 0, col: 0 } },
  { index: 3, type: 'terminal_evaluated', nodeId: 'n1', depth: 1, board: ['X', '', '', '', '', '', '', '', ''], value: 3 },
  { index: 4, type: 'value_returned', nodeId: 'n1', depth: 1, value: 3 },
  { index: 5, type: 'value_returned', nodeId: 'n0', depth: 0, value: 3 },
  { index: 6, type: 'best_move_updated', move: { row: 0, col: 0 }, value: 3 },
]

describe('applyEvent', () => {
  it('creates the root node on the first node_entered event', () => {
    const state = applyEvent(EMPTY_REPLAY_STATE, EVENTS[0])
    expect(state.rootId).toBe('n0')
    expect(state.revealedNodes.n0.parentId).toBeNull()
    expect(state.openStack).toEqual(['n0'])
  })

  it('appends a child to its parent and opens it on the stack', () => {
    let state = applyEvent(EMPTY_REPLAY_STATE, EVENTS[0])
    state = applyEvent(state, EVENTS[1])
    state = applyEvent(state, EVENTS[2])
    expect(state.revealedNodes.n0.childrenIds).toEqual(['n1'])
    expect(state.openStack).toEqual(['n0', 'n1'])
  })

  it('marks a terminal node evaluated with its score', () => {
    let state = buildStateAtIndex(EVENTS, 3)
    expect(state.revealedNodes.n1.isTerminal).toBe(true)
    expect(state.revealedNodes.n1.evaluation).toBe(3)
    expect(state.revealedNodes.n1.status).toBe('evaluated')
  })

  it('pops the stack and marks the node completed on value_returned (non-terminal)', () => {
    const state = buildStateAtIndex(EVENTS, 5)
    expect(state.openStack).toEqual([])
    expect(state.revealedNodes.n0.status).toBe('completed')
    expect(state.revealedNodes.n0.evaluation).toBe(3)
  })

  it('does not overwrite a terminal node\'s "evaluated" status via value_returned', () => {
    const state = buildStateAtIndex(EVENTS, 4)
    expect(state.revealedNodes.n1.status).toBe('evaluated')
  })

  it('records best_move_updated without altering any node', () => {
    const before = buildStateAtIndex(EVENTS, 5)
    const after = applyEvent(before, EVENTS[6])
    expect(after.bestMoveSoFar).toEqual({ move: { row: 0, col: 0 }, score: 3 })
    expect(after.revealedNodes).toEqual(before.revealedNodes)
  })

  it('creates a pruned stub with no children and no board on branch_pruned', () => {
    const prunedEvent: SearchEvent = { index: 0, type: 'branch_pruned', nodeId: 'p0', parentId: null, depth: 1, move: { row: 2, col: 2 } }
    const state = applyEvent(EMPTY_REPLAY_STATE, prunedEvent)
    const node = state.revealedNodes.p0
    expect(node.status).toBe('pruned')
    expect(node.board).toBeNull()
    expect(node.evaluation).toBeNull()
    expect(node.childrenIds).toEqual([])
  })

  it('updates alpha/beta on the correct node without touching others', () => {
    let state = buildStateAtIndex(EVENTS, 2) // n0, n1 both open
    state = applyEvent(state, { index: 7, type: 'alpha_updated', nodeId: 'n0', depth: 0, oldAlpha: -1000000, newAlpha: 3 })
    expect(state.revealedNodes.n0.alpha).toBe(3)
    expect(state.revealedNodes.n1.alpha).toBeNull()
  })

  it('leaves state unchanged (except lastEvent) for an event referencing an unknown node', () => {
    const before = buildStateAtIndex(EVENTS, 2)
    const after = applyEvent(before, { index: 99, type: 'alpha_updated', nodeId: 'does-not-exist', depth: 0, oldAlpha: 0, newAlpha: 5 })
    expect(after.revealedNodes).toEqual(before.revealedNodes)
    expect(after.lastEvent?.index).toBe(99)
  })
})

describe('buildStateAtIndex', () => {
  it('replays zero events for index -1', () => {
    expect(buildStateAtIndex(EVENTS, -1)).toEqual(EMPTY_REPLAY_STATE)
  })

  it('replaying the full sequence incrementally matches replaying it in one shot', () => {
    let incremental = EMPTY_REPLAY_STATE
    for (const event of EVENTS) {
      incremental = applyEvent(incremental, event)
    }
    const oneShot = buildStateAtIndex(EVENTS, EVENTS.length - 1)
    expect(incremental).toEqual(oneShot)
  })

  it('clamps an out-of-range index to the last real event', () => {
    const clamped = buildStateAtIndex(EVENTS, 999)
    const last = buildStateAtIndex(EVENTS, EVENTS.length - 1)
    expect(clamped).toEqual(last)
  })

  it('never mutates the input events array', () => {
    const copy = JSON.parse(JSON.stringify(EVENTS))
    buildStateAtIndex(EVENTS, EVENTS.length - 1)
    expect(EVENTS).toEqual(copy)
  })
})
