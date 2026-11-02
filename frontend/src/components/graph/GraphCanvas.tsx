import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'

/**
 * Reusable graph viewport: real zoom/pan (CSS transform, no graph
 * library) around a static illustrative SVG tree. The tree is
 * intentionally generic and clearly labeled — it is NOT a real
 * Minimax/Alpha-Beta execution. See docs/DESIGN_DECISIONS.md and
 * docs/FRONTEND_ARCHITECTURE.md for the Phase 7 visualization-library
 * decision this placeholder defers.
 */
export function GraphCanvas({ illustrative = true }: { illustrative?: boolean }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
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
  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-sm border border-graph-grid lg:h-[520px]">
      <div
        className="graph-grid-bg h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={
          illustrative
            ? 'Illustrative example search tree graph, not a real algorithm execution. Pan by dragging, zoom with the controls.'
            : 'Empty search tree graph canvas, awaiting a real search run.'
        }
      >
        <div
          className="flex h-full w-full items-center justify-center transition-transform"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          {illustrative ? <IllustrativeTree /> : <EmptyCanvasHint />}
        </div>
      </div>

      {illustrative && (
        <span className="absolute left-3 top-3 rounded-sm border border-state-warning/40 bg-bg-base/90 px-2.5 py-1 font-mono text-[11px] text-state-warning">
          Illustrative example — not a real execution
        </span>
      )}

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 2.2))}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={reset}
          aria-label="Reset pan and zoom"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-graph-grid bg-bg-base/80 text-text-secondary hover:text-text-primary"
        >
          <Maximize size={14} />
        </button>
      </div>
    </div>
  )
}

function EmptyCanvasHint() {
  return <p className="font-mono text-sm text-text-tertiary">Run a search to see it visualized here.</p>
}

function IllustrativeTree() {
  return (
    <svg width="360" height="260" viewBox="0 0 360 260" aria-hidden="true">
      <g stroke="#2a2d3a" strokeWidth="2">
        <line x1="180" y1="30" x2="80" y2="110" />
        <line x1="180" y1="30" x2="180" y2="110" />
        <line x1="180" y1="30" x2="280" y2="110" />
        <line x1="80" y1="110" x2="40" y2="200" />
        <line x1="80" y1="110" x2="120" y2="200" />
        <line x1="280" y1="110" x2="240" y2="200" opacity="0.35" strokeDasharray="4 4" />
        <line x1="280" y1="110" x2="320" y2="200" opacity="0.35" strokeDasharray="4 4" />
      </g>
      <circle cx="180" cy="30" r="14" fill="#22d3ee" />
      <circle cx="80" cy="110" r="12" fill="#a855f7" />
      <circle cx="180" cy="110" r="12" fill="#a855f7" opacity="0.6" stroke="#3f3f56" strokeDasharray="3 3" />
      <circle cx="280" cy="110" r="12" fill="#374151" opacity="0.5" />
      <circle cx="40" cy="200" r="10" fill="#22d3ee" />
      <circle cx="120" cy="200" r="10" fill="#22d3ee" />
      <circle cx="240" cy="200" r="10" fill="#374151" opacity="0.4" />
      <circle cx="320" cy="200" r="10" fill="#374151" opacity="0.4" />
    </svg>
  )
}
