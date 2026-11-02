import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AVAILABLE_POSITIONS } from '@/lib/searchTreeFixtures'
import { useSearchTreeExplorer } from '@/hooks/useSearchTreeExplorer'
import { SearchTreeExplorerView } from './SearchTreeExplorerView'
import { ComparisonSummary } from './ComparisonSummary'

/** Runs Minimax and Alpha-Beta on the same position side by side —
 * one shared position selector drives both, since a comparison is
 * only meaningful when both ran on an identical starting state. Each
 * explorer still gets its own independent playback/inspection. */
export function ComparisonWorkspace() {
  const minimaxExplorer = useSearchTreeExplorer('minimax')
  const alphaBetaExplorer = useSearchTreeExplorer('alpha_beta')
  const [sharedPositionId, setSharedPositionId] = useState(AVAILABLE_POSITIONS[0].id)
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false)

  useEffect(() => {
    minimaxExplorer.setPositionId(sharedPositionId)
    alphaBetaExplorer.setPositionId(sharedPositionId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedPositionId])

  const selectedPosition = AVAILABLE_POSITIONS.find((p) => p.id === sharedPositionId) ?? AVAILABLE_POSITIONS[0]
  const needsAcknowledgement = selectedPosition.sizeTier === 'large' && !acknowledgedWarning
  const anyLoading = minimaxExplorer.loading || alphaBetaExplorer.loading

  const runComparison = () => {
    void minimaxExplorer.run()
    void alphaBetaExplorer.run()
  }

  const bothRan = minimaxExplorer.fixture !== null && alphaBetaExplorer.fixture !== null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Position (shared by both algorithms — a precomputed demonstration, not a custom board)
          <select
            value={sharedPositionId}
            onChange={(e) => {
              setSharedPositionId(e.target.value)
              setAcknowledgedWarning(false)
            }}
            className="rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary"
          >
            {AVAILABLE_POSITIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {selectedPosition.sizeTier === 'large' && !acknowledgedWarning ? (
          <Button variant="secondary" onClick={() => setAcknowledgedWarning(true)}>
            Acknowledge large-dataset warning to continue
          </Button>
        ) : (
          <Button onClick={runComparison} disabled={anyLoading || needsAcknowledgement}>
            {anyLoading ? 'Running…' : 'Run Comparison'}
          </Button>
        )}
      </div>

      {selectedPosition.sizeTier === 'large' && selectedPosition.warning && (
        <p className="mb-4 text-xs text-state-warning">{selectedPosition.warning}</p>
      )}

      {bothRan && minimaxExplorer.fixture && alphaBetaExplorer.fixture && (
        <ComparisonSummary minimax={minimaxExplorer.fixture} alphaBeta={alphaBetaExplorer.fixture} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-center font-display text-sm font-semibold text-accent-cyan">Minimax</p>
          <SearchTreeExplorerView explorer={minimaxExplorer} runLabel="Run Minimax" hidePositionAndRun />
        </div>
        <div>
          <p className="mb-2 text-center font-display text-sm font-semibold text-graph-node-min">Alpha-Beta</p>
          <SearchTreeExplorerView explorer={alphaBetaExplorer} runLabel="Run Alpha-Beta" hidePositionAndRun />
        </div>
      </div>
    </div>
  )
}
