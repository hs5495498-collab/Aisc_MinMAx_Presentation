import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AVAILABLE_POSITIONS } from '@/lib/searchTreeFixtures'

interface SearchConfigPanelProps {
  positionId: string
  onPositionChange: (id: string) => void
  onRun: () => void
  loading: boolean
  depthFilter: number
  onDepthFilterChange: (depth: number) => void
  nodeCap: number
  onNodeCapChange: (cap: number) => void
  maxDepth?: number
  runLabel: string
  /** Used by ComparisonWorkspace, which renders one shared position
   * selector + Run button above two of these panels (one per
   * algorithm) rather than duplicating them per panel. */
  hidePositionAndRun?: boolean
}

/** Never auto-runs a search on mount — the user must press Run, and a
 * "large" position requires an explicit acknowledgement first (Phase 7
 * brief §5: "Do not run a full... search automatically when the page
 * loads" / "warning when the event volume is large"). */
export function SearchConfigPanel({
  positionId,
  onPositionChange,
  onRun,
  loading,
  depthFilter,
  onDepthFilterChange,
  nodeCap,
  onNodeCapChange,
  maxDepth = 9,
  runLabel,
  hidePositionAndRun = false,
}: SearchConfigPanelProps) {
  const selected = AVAILABLE_POSITIONS.find((p) => p.id === positionId) ?? AVAILABLE_POSITIONS[0]
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false)

  const needsAcknowledgement = selected.sizeTier === 'large' && !acknowledgedWarning

  return (
    <div className="space-y-4 text-xs">
      {!hidePositionAndRun && (
        <>
          <div>
            <label className="mb-1 block text-text-tertiary">
              Position
              <span className="ml-1 font-normal text-text-tertiary/70">
                (precomputed demonstration, not a live custom board)
              </span>
            </label>
            <select
              value={positionId}
              onChange={(e) => {
                onPositionChange(e.target.value)
                setAcknowledgedWarning(false)
              }}
              className="w-full rounded-sm border border-graph-grid bg-transparent px-2 py-1.5 text-text-secondary"
            >
              {AVAILABLE_POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {selected.sizeTier === 'large' && selected.warning && (
            <div className="flex items-start gap-2 rounded-sm border border-dashed border-state-warning/50 bg-state-warning/5 p-2 text-state-warning">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p>{selected.warning}</p>
                {!acknowledgedWarning && (
                  <button
                    onClick={() => setAcknowledgedWarning(true)}
                    className="mt-1.5 underline hover:no-underline"
                  >
                    I understand, show it anyway
                  </button>
                )}
              </div>
            </div>
          )}

          <Button onClick={onRun} disabled={loading || needsAcknowledgement} className="w-full">
            {loading ? 'Running…' : runLabel}
          </Button>
          <p className="text-[11px] leading-snug text-text-tertiary">
            "Run" replays one of {AVAILABLE_POSITIONS.length} positions generated offline from the
            real solver (see docs/SEARCH_TREE_VISUALIZATION.md) — building an arbitrary custom board
            requires a backend API, planned for Phase 12.
          </p>
        </>
      )}

      <div>
        <label className="mb-1 flex justify-between text-text-tertiary">
          <span>Depth filter</span>
          <span className="font-mono">≤ {depthFilter}</span>
        </label>
        <input
          type="range"
          min={0}
          max={maxDepth}
          value={depthFilter}
          onChange={(e) => onDepthFilterChange(Number(e.target.value))}
          className="w-full accent-accent-violet"
        />
      </div>

      <div>
        <label className="mb-1 flex justify-between text-text-tertiary">
          <span>Max rendered nodes</span>
          <span className="font-mono">{nodeCap}</span>
        </label>
        <input
          type="range"
          min={20}
          max={600}
          step={20}
          value={nodeCap}
          onChange={(e) => onNodeCapChange(Number(e.target.value))}
          className="w-full accent-accent-violet"
        />
      </div>
    </div>
  )
}
