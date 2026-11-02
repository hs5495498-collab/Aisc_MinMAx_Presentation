import { useCallback, useMemo, useState } from 'react'
import type { Algorithm, SearchTreeFixture } from '@/types/searchTree'
import { AVAILABLE_POSITIONS, loadSearchTreeFixture } from '@/lib/searchTreeFixtures'
import { layoutTree, selectRenderedNodes } from '@/lib/searchTreeLayout'
import { useSearchTreePlayback } from './useSearchTreePlayback'

const DEFAULT_DEPTH_FILTER = 9
const DEFAULT_NODE_CAP = 250

// A stable reference for "no fixture loaded yet" — `fixture?.events ?? []`
// would otherwise create a brand-new empty array every render, which
// defeats useSearchTreePlayback's reference-equality check for "did the
// event sequence actually change" and causes an infinite render loop.
const NO_EVENTS: never[] = []

/**
 * One algorithm's full explorer state: which position is selected,
 * the loaded fixture (real recorded search — nothing is computed
 * client-side), the playback engine, and the bounded render
 * selection + layout derived from it. Reused by the Minimax Explorer,
 * Alpha-Beta Explorer, and (twice, side by side) the Search Tree Lab.
 */
export function useSearchTreeExplorer(algorithm: Algorithm) {
  const [positionId, setPositionId] = useState(AVAILABLE_POSITIONS[0].id)
  const [fixture, setFixture] = useState<SearchTreeFixture | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depthFilter, setDepthFilter] = useState(DEFAULT_DEPTH_FILTER)
  const [nodeCap, setNodeCap] = useState(DEFAULT_NODE_CAP)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSelectedNodeId(null)
    try {
      const data = await loadSearchTreeFixture(positionId, algorithm)
      setFixture(data)
    } catch (err) {
      setFixture(null)
      setError(err instanceof Error ? err.message : 'Failed to load this search tree.')
    } finally {
      setLoading(false)
    }
  }, [positionId, algorithm])

  const playback = useSearchTreePlayback(fixture?.events ?? NO_EVENTS)

  const selection = useMemo(
    () =>
      selectRenderedNodes(playback.state.revealedNodes, playback.state.openStack, {
        maxDepth: depthFilter,
        maxNodes: nodeCap,
      }),
    [playback.state, depthFilter, nodeCap],
  )

  const layout = useMemo(
    () => layoutTree(playback.state.revealedNodes, playback.state.rootId, selection.renderedIds),
    [playback.state, selection.renderedIds],
  )

  const selectedNode = selectedNodeId ? playback.state.revealedNodes[selectedNodeId] ?? null : null

  return {
    positionId,
    setPositionId,
    fixture,
    loading,
    error,
    run,
    hasRun: fixture !== null,
    playback,
    depthFilter,
    setDepthFilter,
    nodeCap,
    setNodeCap,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selection,
    layout,
  }
}

export type UseSearchTreeExplorerReturn = ReturnType<typeof useSearchTreeExplorer>
