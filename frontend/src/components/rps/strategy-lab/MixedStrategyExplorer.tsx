import { Card } from '@/components/ui/Card'
import { ProbabilityInputGroup } from './ProbabilityInputGroup'
import type { UseRpsStrategyLabReturn } from '@/hooks/useRpsStrategyLab'

/**
 * Lets the player edit both players' mixed strategies directly. This
 * is the primary editor for the shared `playerA`/`playerB` state
 * consumed by every other tab in the RPS Strategy Lab — a change made
 * here is immediately visible in the Expected Payoff Calculator, Best
 * Response Lab, Nash Equilibrium Explorer, and Exploitability
 * Demonstration tabs, since they all read from the same lifted state.
 */
export function MixedStrategyExplorer({ playerA, playerB }: UseRpsStrategyLabReturn) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Player A's strategy">
        <ProbabilityInputGroup
          label="Player A"
          value={playerA.value}
          error={playerA.error}
          onChange={playerA.set}
          onReset={playerA.reset}
          onNormalize={playerA.normalize}
        />
      </Card>
      <Card title="Player B's strategy">
        <ProbabilityInputGroup
          label="Player B"
          value={playerB.value}
          error={playerB.error}
          onChange={playerB.set}
          onReset={playerB.reset}
          onNormalize={playerB.normalize}
        />
      </Card>
      <Card className="lg:col-span-2">
        <p className="text-sm text-text-secondary">
          A <strong className="text-text-primary">pure strategy</strong> always plays the same action
          (probability 1 on one action, 0 on the others). A{' '}
          <strong className="text-text-primary">mixed strategy</strong> spreads probability across more than
          one action. Probabilities must be finite, non-negative, and sum to exactly 1 (within a tolerance of
          1e-9, the same tolerance the Python engine uses) — this editor never silently rescales an invalid
          distribution into validity; use the explicit &quot;Normalize to sum 1&quot; action for that, or fix
          the numbers directly.
        </p>
      </Card>
    </div>
  )
}
