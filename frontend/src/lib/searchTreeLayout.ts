import type { VisualNode } from '@/types/searchTree'

export interface LaidOutNode {
  node: VisualNode
  x: number
  y: number
}

export interface TreeLayout {
  positions: Record<string, LaidOutNode>
  width: number
  height: number
}

const H_SPACING = 72
const V_SPACING = 90

/**
 * A simple tidy-tree layout (not a general graph library): leaves get
 * sequential x slots left-to-right in traversal order, and each
 * internal node is centered over the mean x of its own rendered
 * children. This is sufficient for Tic-Tac-Toe-scale trees (at most a
 * few hundred nodes rendered at once — see §"Large-Tree Performance"
 * in docs/SEARCH_TREE_VISUALIZATION.md) and avoids adding a graph
 * library for a problem this small.
 *
 * Only `renderedIds` are laid out — callers pass a bounded, filtered
 * subset (see `selectRenderedNodes`), not the full revealed set, so
 * layout cost never scales with the true (possibly huge) search tree.
 */
export function layoutTree(
  nodes: Record<string, VisualNode>,
  rootId: string | null,
  renderedIds: Set<string>,
): TreeLayout {
  const positions: Record<string, LaidOutNode> = {}
  let nextLeafSlot = 0
  let maxDepth = 0

  function visit(nodeId: string): number {
    const node = nodes[nodeId]
    if (!node) return nextLeafSlot
    maxDepth = Math.max(maxDepth, node.depth)
    const renderedChildren = node.childrenIds.filter((id) => renderedIds.has(id) && nodes[id])

    let x: number
    if (renderedChildren.length === 0) {
      x = nextLeafSlot
      nextLeafSlot += 1
    } else {
      const childXs = renderedChildren.map((id) => visit(id))
      x = childXs.reduce((a, b) => a + b, 0) / childXs.length
    }

    if (renderedIds.has(nodeId)) {
      positions[nodeId] = { node, x: x * H_SPACING, y: node.depth * V_SPACING }
    }
    return x
  }

  if (rootId && renderedIds.has(rootId)) {
    visit(rootId)
  }

  const width = Math.max(H_SPACING, (nextLeafSlot + 1) * H_SPACING)
  const height = Math.max(V_SPACING, (maxDepth + 1) * V_SPACING)
  return { positions, width, height }
}

export interface RenderSelection {
  renderedIds: Set<string>
  hiddenByDepthFilter: number
  hiddenByWindow: number
}

/**
 * Chooses a bounded subset of `revealedNodes` to actually render,
 * never the full set once it grows large — see the Phase 7 brief's
 * "Large-Tree Performance Requirements". The active path (root down
 * to whatever node is currently open) is always included, even if it
 * would otherwise fall outside the window, so playback never looks
 * like it "lost" the node currently being explored.
 */
export function selectRenderedNodes(
  revealedNodes: Record<string, VisualNode>,
  openStack: string[],
  options: { maxDepth: number; maxNodes: number },
): RenderSelection {
  const allIds = Object.keys(revealedNodes)
  const withinDepth = allIds.filter((id) => revealedNodes[id].depth <= options.maxDepth)
  const hiddenByDepthFilter = allIds.length - withinDepth.length

  if (withinDepth.length <= options.maxNodes) {
    return { renderedIds: new Set(withinDepth), hiddenByDepthFilter, hiddenByWindow: 0 }
  }

  // Keep the active path unconditionally, then fill the remaining
  // budget with the most-recently-created nodes (highest numeric
  // suffix in "nY" ids == most recently discovered, since ids are
  // assigned by a monotonic counter in discovery order).
  const activePath = new Set(openStack.filter((id) => withinDepth.includes(id)))
  const remaining = withinDepth
    .filter((id) => !activePath.has(id))
    .sort((a, b) => nodeIdOrdinal(b) - nodeIdOrdinal(a))
  const budget = Math.max(0, options.maxNodes - activePath.size)
  const windowed = new Set([...activePath, ...remaining.slice(0, budget)])

  return {
    renderedIds: windowed,
    hiddenByDepthFilter,
    hiddenByWindow: withinDepth.length - windowed.size,
  }
}

function nodeIdOrdinal(id: string): number {
  const match = /^n(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}
