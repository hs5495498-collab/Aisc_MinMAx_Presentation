import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import type { TreeLayout } from '@/lib/searchTreeLayout'
import { formatEvaluation } from '@/lib/searchTreeExplain'

const ROLE_COLOR = { MAX: '#22d3ee', MIN: '#a855f7' } as const

interface SearchTreeCanvasProps {
  layout: TreeLayout
  selectedNodeId: string | null
  activeNodeId: string | null
  onSelectNode: (nodeId: string) => void
  hiddenCount: number
}

/**
 * Renders the bounded, already-filtered set of nodes in `layout` as
 * plain SVG — no graph library. Justification (see
 * docs/SEARCH_TREE_VISUALIZATION.md "Graph Rendering Approach"):
 * Tic-Tac-Toe's real trees only need a few hundred nodes on screen at
 * once even for the "large" shipped fixture, once depth-filtered and
 * windowed (`selectRenderedNodes`) — well within what plain SVG
 * handles smoothly, so a canvas/WebGL renderer or a general graph
 * library would be unused weight for this project's actual scale.
 */
export function SearchTreeCanvas({
  layout,
  selectedNodeId,
  activeNodeId,
  onSelectNode,
  hiddenCount,
}: SearchTreeCanvasProps) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 24, y: 24 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    setOffset({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y })
  }
  const onPointerUp = () => {
    dragRef.current = null
  }
  const fitToScreen = () => {
    setScale(1)
    setOffset({ x: 24, y: 24 })
  }

  const entries = Object.entries(layout.positions)

  return (
    <div className="relative h-[420px] overflow-hidden rounded-sm border border-graph-grid lg:h-[520px]">
      <div
        className="graph-grid-bg h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={`Search tree canvas showing ${entries.length} of the revealed nodes. Pan by dragging, zoom with the controls.`}
      >
        <svg
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {entries.map(([id, { node, x, y }]) => {
              if (!node.parentId) return null
              const parent = layout.positions[node.parentId]
              if (!parent) return null
              const isActivePathEdge = id === activeNodeId
              return (
                <line
                  key={`edge-${id}`}
                  x1={parent.x + 20}
                  y1={parent.y + 20}
                  x2={x + 20}
                  y2={y + 20}
                  stroke={isActivePathEdge ? '#67e8f9' : '#2a2d3a'}
                  strokeWidth={isActivePathEdge ? 2 : 1}
                  strokeDasharray={node.status === 'pruned' ? '4 4' : undefined}
                />
              )
            })}
            {entries.map(([id, { node, x, y }]) => {
              const isSelected = id === selectedNodeId
              const isActive = id === activeNodeId
              const roleColor = node.role ? ROLE_COLOR[node.role] : '#3f3f56'
              const isPruned = node.status === 'pruned'
              return (
                <g
                  key={id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => onSelectNode(id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.role ?? 'Pruned'} node${node.evaluation !== null ? `, value ${node.evaluation}` : ''}${isPruned ? ', pruned' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectNode(id)
                  }}
                  className="cursor-pointer outline-none"
                >
                  <circle
                    r={16}
                    cx={20}
                    cy={20}
                    fill={isPruned ? '#374151' : roleColor}
                    fillOpacity={isPruned ? 0.4 : node.status === 'visited' ? 0.55 : 1}
                    stroke={isSelected ? '#facc15' : isActive ? '#facc15' : 'none'}
                    strokeWidth={isSelected ? 3 : isActive ? 2 : 0}
                    strokeDasharray={isPruned ? '3 3' : undefined}
                  >
                    {isActive && !isPruned && (
                      <animate attributeName="r" values="16;19;16" dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <text
                    x={20}
                    y={24}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="monospace"
                    fill={isPruned ? '#9ca3af' : '#05060c'}
                    fontWeight={700}
                  >
                    {isPruned ? '×' : node.evaluation !== null ? formatEvaluation(node.evaluation) : ''}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {hiddenCount > 0 && (
        <span className="absolute left-3 top-3 rounded-sm border border-state-warning/40 bg-bg-base/90 px-2.5 py-1 font-mono text-[11px] text-state-warning">
          {hiddenCount} node{hiddenCount === 1 ? '' : 's'} hidden by current filter — not the complete tree
        </span>
      )}

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={fitToScreen}
          aria-label="Fit to screen"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <Maximize size={14} />
        </button>
      </div>
    </div>
  )
}
