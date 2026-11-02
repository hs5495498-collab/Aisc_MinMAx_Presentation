import { ACTIONS } from '@/types/rps'
import type { Action, ProbabilityTriple } from '@/types/rps'
import { Button } from '@/components/ui/Button'

const ACTION_LABELS: Record<Action, string> = { ROCK: 'Rock', PAPER: 'Paper', SCISSORS: 'Scissors' }

interface ProbabilityInputGroupProps {
  label: string
  value: ProbabilityTriple
  error: string | null
  onChange: (next: ProbabilityTriple) => void
  onReset: () => void
  onNormalize: () => void
  disabled?: boolean
}

function clampForDisplay(p: number): number {
  if (!Number.isFinite(p)) return 0
  return Math.min(1, Math.max(0, p))
}

/**
 * The shared probability editor used throughout the RPS Strategy Lab:
 * one slider + one numeric input per action, a live percentage/decimal
 * readout, and a probability bar. Deliberately does **not**
 * auto-rebalance the other two actions when one changes, and never
 * normalizes on its own — see `useRpsStrategyLab.ts`. An invalid
 * (non-summing-to-1, negative, or non-finite) distribution is shown
 * exactly as entered, with the validation message surfaced via
 * `error`, until the player fixes it or uses the explicit "Normalize"
 * action.
 */
export function ProbabilityInputGroup({
  label,
  value,
  error,
  onChange,
  onReset,
  onNormalize,
  disabled = false,
}: ProbabilityInputGroupProps) {
  const total = value.ROCK + value.PAPER + value.SCISSORS
  const isPure = ACTIONS.some((a) => value[a] === 1 && ACTIONS.every((other) => other === a || value[other] === 0))

  const handleFieldChange = (action: Action, raw: string) => {
    const parsed = raw === '' ? Number.NaN : Number(raw)
    onChange({ ...value, [action]: parsed })
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="text-sm font-semibold text-text-primary">{label}</legend>
        <span className="text-xs text-text-tertiary">
          {isPure ? 'Pure strategy' : 'Mixed strategy'} · sum ={' '}
          <span className={Math.abs(total - 1) > 1e-9 ? 'font-mono text-state-error' : 'font-mono text-state-success'}>
            {Number.isFinite(total) ? total.toFixed(4) : 'invalid'}
          </span>
        </span>
      </div>

      {ACTIONS.map((action) => (
        <div key={action} className="grid grid-cols-[72px_1fr_84px] items-center gap-3">
          <label htmlFor={`${label}-${action}`} className="text-xs text-text-secondary">
            {ACTION_LABELS[action]}
          </label>
          <input
            id={`${label}-${action}`}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={clampForDisplay(value[action])}
            onChange={(e) => handleFieldChange(action, e.target.value)}
            disabled={disabled}
            aria-label={`${label} probability of ${ACTION_LABELS[action]}`}
            className="h-2 w-full cursor-pointer accent-accent-violet"
          />
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={Number.isFinite(value[action]) ? value[action] : ''}
            onChange={(e) => handleFieldChange(action, e.target.value)}
            disabled={disabled}
            aria-label={`${label} exact probability of ${ACTION_LABELS[action]}`}
            className="w-full rounded-sm border border-surface-card-border bg-black/20 px-2 py-1 text-right font-mono text-xs text-text-primary disabled:opacity-50"
          />
        </div>
      ))}

      <div className="space-y-2">
        {ACTIONS.map((action) => (
          <div key={action} className="h-2 w-full overflow-hidden rounded-pill bg-white/10">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-accent-violet to-accent-cyan"
              style={{ width: `${clampForDisplay(value[action]) * 100}%` }}
            />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-xs text-state-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onReset} disabled={disabled} className="text-xs">
          Reset to uniform
        </Button>
        <Button type="button" variant="ghost" onClick={onNormalize} disabled={disabled} className="text-xs">
          Normalize to sum 1
        </Button>
      </div>
    </fieldset>
  )
}
