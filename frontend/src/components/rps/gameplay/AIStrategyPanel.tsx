import { useState } from 'react'
import type { AIStrategyConfig, AIStrategyKind } from '@/types/rps'
import { explainAiStrategy, resolveAiStrategy, validateProbabilities } from '@/lib/rpsEngine'
import { ProbabilityBar } from '@/components/rps/ProbabilityBar'

const STRATEGY_LABELS: Record<AIStrategyKind, string> = {
  NASH_UNIFORM: 'Nash Equilibrium (uniform)',
  RANDOM_UNIFORM: 'Random (uniform)',
  CUSTOM: 'Custom distribution',
  BIASED_DEMO: 'Biased demonstration',
}

interface AIStrategyPanelProps {
  value: AIStrategyConfig
  onChange: (config: AIStrategyConfig) => void
  disabled: boolean
}

/** Never shows the AI's current-round action — only its configured
 * strategy and overall probability distribution, which is public
 * information by design (knowing the distribution doesn't reveal any
 * single round's outcome in a simultaneous-action game). */
export function AIStrategyPanel({ value, onChange, disabled }: AIStrategyPanelProps) {
  const [customText, setCustomText] = useState({ ROCK: '0.5', PAPER: '0.3', SCISSORS: '0.2' })
  const [customError, setCustomError] = useState<string | null>(null)

  const handleKindChange = (kind: AIStrategyKind) => {
    if (kind === 'CUSTOM') {
      applyCustom(customText)
    } else {
      setCustomError(null)
      onChange({ kind })
    }
  }

  const applyCustom = (inputs: typeof customText) => {
    const probs = { ROCK: Number(inputs.ROCK), PAPER: Number(inputs.PAPER), SCISSORS: Number(inputs.SCISSORS) }
    try {
      validateProbabilities(probs)
      setCustomError(null)
      onChange({ kind: 'CUSTOM', customProbabilities: probs })
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Invalid distribution.')
    }
  }

  const probabilities = (() => {
    try {
      return resolveAiStrategy(value)
    } catch {
      return null
    }
  })()

  return (
    <div className="space-y-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-text-tertiary">AI Strategy</span>
        <select
          value={value.kind}
          disabled={disabled}
          onChange={(e) => handleKindChange(e.target.value as AIStrategyKind)}
          className="rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary disabled:opacity-50"
        >
          {(Object.keys(STRATEGY_LABELS) as AIStrategyKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {STRATEGY_LABELS[kind]}
            </option>
          ))}
        </select>
      </label>

      {value.kind === 'CUSTOM' && (
        <div className="space-y-2 rounded-md border border-surface-card-border p-3">
          <p className="text-xs text-text-tertiary">Set probabilities (must sum to 1):</p>
          <div className="grid grid-cols-3 gap-2">
            {(['ROCK', 'PAPER', 'SCISSORS'] as const).map((action) => (
              <label key={action} className="flex flex-col gap-1 text-xs text-text-tertiary">
                {action}
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={customText[action]}
                  disabled={disabled}
                  onChange={(e) => {
                    const next = { ...customText, [action]: e.target.value }
                    setCustomText(next)
                    applyCustom(next)
                  }}
                  aria-label={`Probability for ${action}`}
                  className="rounded-sm border border-surface-card-border bg-black/20 px-2 py-1 text-text-primary"
                />
              </label>
            ))}
          </div>
          {customError && (
            <p role="alert" className="text-xs text-state-error">
              {customError}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-text-secondary">{explainAiStrategy(value)}</p>

      {probabilities && (
        <div className="space-y-2">
          <ProbabilityBar label="Rock" probability={probabilities.ROCK} />
          <ProbabilityBar label="Paper" probability={probabilities.PAPER} />
          <ProbabilityBar label="Scissors" probability={probabilities.SCISSORS} />
        </div>
      )}
    </div>
  )
}
