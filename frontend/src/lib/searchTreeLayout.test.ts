import { describe, expect, it } from 'vitest'
import { layoutTree, selectRenderedNodes } from './searchTreeLayout'
import type { VisualNode } from '@/types/searchTree'

function makeNode(overrides: Partial<VisualNode>): VisualNode {
  return {
    id: 'n0',
    parentId: null,
    depth: 0,
    role: 'MAX',
    board: null,
    move: null,
    status: 'visited',
    evaluation: null,
    alpha: null,
    beta: null,
    isTerminal: false,
    terminalResult: null,
    childrenIds: [],
    ...overrides,
  }
}

describe('selectRenderedNodes', () => {
  it('renders everything when under the node cap and depth limit', () => {
    const nodes = {
      n0: makeNode({ id: 'n0', depth: 0, childrenIds: ['n1'] }),
      n1: makeNode({ id: 'n1', depth: 1, parentId: 'n0' }),
    }
    const selection = selectRenderedNodes(nodes, ['n0', 'n1'], { maxDepth: 9, maxNodes: 100 })
    expect(selection.renderedIds).toEqual(new Set(['n0', 'n1']))
    expect(selection.hiddenByDepthFilter).toBe(0)
    expect(selection.hiddenByWindow).toBe(0)
  })

  it('hides nodes deeper than the depth filter', () => {
    const nodes = {
      n0: makeNode({ id: 'n0', depth: 0 }),
      n1: makeNode({ id: 'n1', depth: 5 }),
    }
    const selection = selectRenderedNodes(nodes, [], { maxDepth: 2, maxNodes: 100 })
    expect(selection.renderedIds.has('n0')).toBe(true)
    expect(selection.renderedIds.has('n1')).toBe(false)
    expect(selection.hiddenByDepthFilter).toBe(1)
  })

  it('always keeps the active path even when the node cap would otherwise exclude it', () => {
    const nodes: Record<string, VisualNode> = {}
    for (let i = 0; i < 50; i++) {
      nodes[`n${i}`] = makeNode({ id: `n${i}`, depth: 1 })
    }
    // n0 is the "oldest" node and would normally be evicted by the
    // most-recent-first window — but it's on the active path.
    const selection = selectRenderedNodes(nodes, ['n0'], { maxDepth: 9, maxNodes: 10 })
    expect(selection.renderedIds.has('n0')).toBe(true)
    expect(selection.renderedIds.size).toBeLessThanOrEqual(10)
    expect(selection.hiddenByWindow).toBeGreaterThan(0)
  })

  it('never mutates the input nodes map (filtering must not corrupt the underlying data)', () => {
    const nodes = {
      n0: makeNode({ id: 'n0', depth: 0, childrenIds: ['n1'] }),
      n1: makeNode({ id: 'n1', depth: 1, parentId: 'n0' }),
    }
    const snapshot = JSON.parse(JSON.stringify(nodes))
    selectRenderedNodes(nodes, ['n0', 'n1'], { maxDepth: 0, maxNodes: 1 })
    expect(nodes).toEqual(snapshot)
  })
})

describe('layoutTree', () => {
  it('positions the root at depth 0 and children one row below', () => {
    const nodes = {
      n0: makeNode({ id: 'n0', depth: 0, childrenIds: ['n1', 'n2'] }),
      n1: makeNode({ id: 'n1', depth: 1, parentId: 'n0' }),
      n2: makeNode({ id: 'n2', depth: 1, parentId: 'n0' }),
    }
    const layout = layoutTree(nodes, 'n0', new Set(['n0', 'n1', 'n2']))
    expect(layout.positions.n0.y).toBeLessThan(layout.positions.n1.y)
    expect(layout.positions.n1.y).toBe(layout.positions.n2.y)
    expect(layout.positions.n1.x).not.toBe(layout.positions.n2.x)
  })

  it('only lays out nodes in the rendered set', () => {
    const nodes = {
      n0: makeNode({ id: 'n0', depth: 0, childrenIds: ['n1'] }),
      n1: makeNode({ id: 'n1', depth: 1, parentId: 'n0' }),
    }
    const layout = layoutTree(nodes, 'n0', new Set(['n0']))
    expect(layout.positions.n0).toBeDefined()
    expect(layout.positions.n1).toBeUndefined()
  })

  it('returns an empty layout when the root is not in the rendered set', () => {
    const nodes = { n0: makeNode({ id: 'n0' }) }
    const layout = layoutTree(nodes, 'n0', new Set())
    expect(Object.keys(layout.positions)).toHaveLength(0)
  })
})
