import { useState } from 'react'
import { ACTIONS } from '@/types/rps'
import type { Action } from '@/types/rps'
import { PAYOFF_MATRIX } from '@/lib/rpsEngine'

const ACTION_LABELS: Record<Action, string> = { ROCK: 'Rock', PAPER: 'Paper', SCISSORS: 'Scissors' }

/** What each action beats, under standard RPS rules — used only to
 * explain *why* a cell has the payoff it does; the actual payoff
 * numbers always come from `PAYOFF_MATRIX` (Phase 8's table), never
 * re-derived from this map. */
const BEATS: Record<Action, Action> = { ROCK: 'SCISSORS', PAPER: 'ROCK', SCISSORS: 'PAPER' }

type Perspective = 'A' | 'B'
type Cell = { a: Action; b: Action }

function explainCell(a: Action, b: Action): string {
  if (a === b) return `Both play ${ACTION_LABELS[a]} — a tie. Neither action beats the other.`
  if (BEATS[a] === b) return `${ACTION_LABELS[a]} beats ${ACTION_LABELS[b]} — Player A wins this pairing.`
  return `${ACTION_LABELS[b]} beats ${ACTION_LABELS[a]} — Player B wins this pairing.`
}

function payoffFor(perspective: Perspective, a: Action, b: Action): number {
  const payoffA = PAYOFF_MATRIX[a][b]
  return perspective === 'A' ? payoffA : -payoffA
}

/**
 * The interactive 3x3 payoff matrix: Player A's actions as rows,
 * Player B's actions as columns, exactly `PAYOFF_MATRIX` from
 * `rpsEngine.ts` (itself a verified mirror of `payoff.py`). The
 * perspective toggle only changes which player's payoff is displayed
 * and color-coded — it never changes the underlying convention or the
 * table itself (Player B's payoff is always `-PAYOFF_MATRIX[a][b]`).
 */
export function InteractivePayoffMatrix() {
  const [perspective, setPerspective] = useState<Perspective>('A')
  const [selected, setSelected] = useState<Cell | null>(null)
  const [hovered, setHovered] = useState<Cell | null>(null)

  const active = hovered ?? selected

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Rows are Player A&apos;s action; columns are Player B&apos;s action. Values shown are from{' '}
          <strong className="text-text-primary">Player {perspective}&apos;s</strong> perspective — the
          underlying table never changes, only which side&apos;s number is displayed.
        </p>
        <div role="group" aria-label="Payoff perspective" className="flex gap-1 rounded-pill border border-surface-card-border p-1">
          {(['A', 'B'] as Perspective[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={perspective === p}
              onClick={() => setPerspective(p)}
              className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                perspective === p ? 'bg-accent-violet/20 text-accent-violet' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              Player {p}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full border-collapse text-center text-sm">
        <caption className="sr-only">
          Rock Paper Scissors zero-sum payoff matrix, Player {perspective}&apos;s perspective
        </caption>
        <thead>
          <tr>
            <th scope="col" className="p-2 text-text-tertiary" />
            {ACTIONS.map((b) => (
              <th key={b} scope="col" className="p-2 text-xs font-medium text-text-tertiary">
                {ACTION_LABELS[b]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTIONS.map((a) => (
            <tr key={a}>
              <th scope="row" className="p-2 text-xs font-medium text-text-tertiary">
                {ACTION_LABELS[a]}
              </th>
              {ACTIONS.map((b) => {
                const value = payoffFor(perspective, a, b)
                const isActive = active?.a === a && active?.b === b
                return (
                  <td key={b} className="p-1">
                    <button
                      type="button"
                      onMouseEnter={() => setHovered({ a, b })}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered({ a, b })}
                      onBlur={() => setHovered(null)}
                      onClick={() => setSelected({ a, b })}
                      aria-pressed={selected?.a === a && selected?.b === b}
                      aria-label={`Player A plays ${ACTION_LABELS[a]}, Player B plays ${ACTION_LABELS[b]}: Player ${perspective}'s payoff is ${value}`}
                      className={`w-full rounded-md border p-3 font-mono font-semibold transition-all ${
                        value > 0
                          ? 'text-state-success'
                          : value < 0
                            ? 'text-state-error'
                            : 'text-text-tertiary'
                      } ${
                        isActive
                          ? 'border-accent-magenta bg-accent-magenta/10'
                          : 'border-surface-card-border hover:border-accent-violet/50'
                      }`}
                    >
                      {value > 0 ? `+${value}` : value}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rounded-md border border-surface-card-border bg-black/20 p-4 text-sm text-text-secondary" aria-live="polite">
        {active ? (
          <>
            <p className="mb-1 font-medium text-text-primary">
              A: {ACTION_LABELS[active.a]} vs. B: {ACTION_LABELS[active.b]}
            </p>
            <p>{explainCell(active.a, active.b)}</p>
            <p className="mt-1 text-xs text-text-tertiary">
              Player A payoff: <span className="font-mono">{PAYOFF_MATRIX[active.a][active.b]}</span> · Player B
              payoff: <span className="font-mono">{-PAYOFF_MATRIX[active.a][active.b]}</span> (always the
              negation — this is a zero-sum game).
            </p>
          </>
        ) : (
          <p className="text-text-tertiary">Hover or select a cell above to see why it produces that payoff.</p>
        )}
      </div>
    </div>
  )
}
