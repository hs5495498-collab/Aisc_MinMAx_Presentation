import { useCallback, useMemo, useState } from 'react'
import type { ProbabilityTriple } from '@/types/rps'
import { InvalidMixedStrategyError, validateProbabilities } from '@/lib/rpsEngine'
import { normalizeWeights, uniformStrategy } from '@/lib/rpsGameTheory'

export interface StrategySlot {
  /** The raw, currently-displayed distribution — may be an invalid
   * (non-summing-to-1, negative, or non-finite) distribution; this
   * hook deliberately never silently corrects it. */
  value: ProbabilityTriple
  /** `null` while `value` is a valid probability distribution; the
   * validation message otherwise. */
  error: string | null
  isValid: boolean
  set: (next: ProbabilityTriple) => void
  reset: () => void
  /** The only path that rescales `value` into validity — an explicit,
   * opt-in action, never triggered automatically by `set`. */
  normalize: () => void
}

function useStrategySlot(initial: ProbabilityTriple): StrategySlot {
  const [value, setValue] = useState<ProbabilityTriple>(initial)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback((next: ProbabilityTriple) => {
    setValue(next)
    try {
      validateProbabilities(next)
      setError(null)
    } catch (err) {
      setError(err instanceof InvalidMixedStrategyError ? err.message : 'Invalid probability distribution.')
    }
  }, [])

  const reset = useCallback(() => {
    setValue(uniformStrategy())
    setError(null)
  }, [])

  const normalize = useCallback(() => {
    setValue((current) => {
      try {
        const normalized = normalizeWeights(current)
        setError(null)
        return normalized
      } catch (err) {
        setError(err instanceof InvalidMixedStrategyError ? err.message : 'Could not normalize this distribution.')
        return current
      }
    })
  }, [])

  return { value, error, isValid: error === null, set, reset, normalize }
}

/**
 * Shared Player A / Player B mixed-strategy state for every tab of the
 * RPS Strategy Lab (`RPSMatrixPage.tsx`). Lifting this one pair of
 * slots to the page lets every dependent visualization — expected
 * payoff, best response, equilibrium check, exploitability — update
 * immediately from the same edit, rather than each tab keeping its
 * own disconnected copy.
 */
export function useRpsStrategyLab() {
  const playerA = useStrategySlot(uniformStrategy())
  const playerB = useStrategySlot(uniformStrategy())

  const bothValid = useMemo(() => playerA.isValid && playerB.isValid, [playerA.isValid, playerB.isValid])

  return { playerA, playerB, bothValid }
}

export type UseRpsStrategyLabReturn = ReturnType<typeof useRpsStrategyLab>
