import { Card } from '@/components/ui/Card'
import { ProbabilityBar } from '@/components/rps/ProbabilityBar'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import { ACTIONS } from '@/types/rps'
import type { Action, ProbabilityTriple } from '@/types/rps'
import { bestResponse, bestResponseValue, isTiedBestResponse, type Player } from '@/lib/rpsGameTheory'
import type { UseRpsStrategyLabReturn } from '@/hooks/useRpsStrategyLab'

const ACTION_LABELS: Record<Action, string> = { ROCK: 'Rock', PAPER: 'Paper', SCISSORS: 'Scissors' }

function BestResponsePanel({
  player,
  opponentLabel,
  opponentStrategy,
}: {
  player: Player
  opponentLabel: string
  opponentStrategy: ProbabilityTriple
}) {
  const result = bestResponse(player, opponentStrategy)
  const best = bestResponseValue(result)
  const tied = isTiedBestResponse(result)

  return (
    <Card title={`Player ${player}'s best response to ${opponentLabel}`}>
      <p className="mb-2 text-xs text-text-tertiary">{opponentLabel}&apos;s distribution:</p>
      <div className="mb-4 space-y-2">
        {ACTIONS.map((a) => (
          <ProbabilityBar key={a} label={ACTION_LABELS[a]} probability={opponentStrategy[a]} />
        ))}
      </div>

      <ComparisonBarChart
        valueLabel={`Player ${player} expected payoff`}
        data={ACTIONS.map((a) => ({
          name: ACTION_LABELS[a],
          value: result.payoffs[a],
          highlighted: result.bestActions.includes(a),
        }))}
      />

      <p className="mt-3 text-sm text-text-secondary">
        Best expected payoff: <span className="font-mono text-text-primary">{best.toFixed(4)}</span>, achieved
        by{' '}
        {tied ? (
          <>
            a <strong className="text-text-primary">tie</strong> across{' '}
            {result.bestActions.map((a) => ACTION_LABELS[a]).join(', ')} — none of these is arbitrarily
            preferred over the others.
          </>
        ) : (
          <strong className="text-text-primary">{ACTION_LABELS[result.bestActions[0]]}</strong>
        )}
        .
      </p>
    </Card>
  )
}

/**
 * Computes Player A's expected payoff for every pure action against
 * Player B's current (shared) strategy, and vice versa — mirrors
 * `analysis.py::best_response` exactly, including preserving genuine
 * ties rather than arbitrarily picking one action.
 */
export function BestResponseLab({ playerA, playerB, bothValid }: UseRpsStrategyLabReturn) {
  if (!bothValid) {
    return (
      <Card>
        <p className="text-sm text-state-warning">
          Fix the invalid distribution in the Mixed Strategy Explorer tab to compute best responses.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BestResponsePanel player="A" opponentLabel="Player B" opponentStrategy={playerB.value} />
      <BestResponsePanel player="B" opponentLabel="Player A" opponentStrategy={playerA.value} />
      <Card className="lg:col-span-2">
        <p className="text-sm text-text-secondary">
          A best response is the pure action (or set of tied actions) that maximizes a player&apos;s expected
          payoff against a <em>fixed</em> opponent distribution. Against the uniform (1/3, 1/3, 1/3)
          distribution every pure action ties at an expected payoff of exactly 0 — there is no single best
          response, which is exactly why the uniform strategy is a Nash equilibrium (see the Nash Equilibrium
          Explorer tab). Edit either player&apos;s strategy in the Mixed Strategy Explorer tab to see these
          best responses update.
        </p>
      </Card>
    </div>
  )
}
