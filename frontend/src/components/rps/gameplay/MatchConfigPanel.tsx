import { useState } from 'react'
import { MAX_BEST_OF, MIN_BEST_OF, validateMatchConfig } from '@/lib/rpsEngine'

const PRESETS = [3, 5, 7] as const

interface MatchConfigPanelProps {
  bestOf: number
  onChange: (bestOf: number) => void
  disabled: boolean
}

export function MatchConfigPanel({ bestOf, onChange, disabled }: MatchConfigPanelProps) {
  const isCustom = !PRESETS.includes(bestOf as 3 | 5 | 7)
  const [customText, setCustomText] = useState(String(bestOf))
  const [error, setError] = useState<string | null>(null)

  const applyCustom = (text: string) => {
    const parsed = Number(text)
    try {
      validateMatchConfig({ bestOf: parsed, aiStrategy: { kind: 'NASH_UNIFORM' } })
      setError(null)
      onChange(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid match length.')
    }
  }

  return (
    <div className="space-y-2 text-sm">
      <label className="text-xs text-text-tertiary">Match length (first to win required rounds)</label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => {
              setError(null)
              onChange(preset)
            }}
            className={`rounded-pill border px-3 py-1.5 text-xs ${
              bestOf === preset
                ? 'border-accent-violet bg-accent-violet/15 text-accent-violet'
                : 'border-surface-card-border text-text-secondary'
            } disabled:opacity-50`}
          >
            Best of {preset}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-xs text-text-tertiary">
          Custom:
          <input
            type="number"
            min={MIN_BEST_OF}
            max={MAX_BEST_OF}
            step={2}
            disabled={disabled}
            value={isCustom ? customText : ''}
            placeholder="e.g. 9"
            onChange={(e) => {
              setCustomText(e.target.value)
              applyCustom(e.target.value)
            }}
            aria-label="Custom match length"
            className="w-20 rounded-sm border border-surface-card-border bg-black/20 px-2 py-1 text-text-primary disabled:opacity-50"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-xs text-state-error">
          {error}
        </p>
      )}
      <p className="text-xs text-text-tertiary">
        Must be odd (so the match always has a decisive winner), between {MIN_BEST_OF} and {MAX_BEST_OF}. Ties
        don&apos;t count toward either side — the match continues until someone reaches the required wins.
      </p>
    </div>
  )
}
