import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ProbabilityBar } from '@/components/rps/ProbabilityBar'
import { ACTIONS } from '@/types/rps'
import type { ProbabilityTriple } from '@/types/rps'
import { DEFAULT_BIASED_DEMO_PROBABILITIES } from '@/lib/rpsEngine'
import { deriveUniformEquilibrium, expectedPayoffA, uniformStrategy, verifyEquilibrium } from '@/lib/rpsGameTheory'

type Scenario = 'both_uniform' | 'a_deviates' | 'b_deviates' | 'both_biased'

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'both_uniform', label: 'Both players use the uniform equilibrium' },
  { id: 'a_deviates', label: 'Player A deviates, Player B stays uniform' },
  { id: 'b_deviates', label: 'Player B deviates, Player A stays uniform' },
  { id: 'both_biased', label: 'Both players use a biased strategy' },
]

const ACTION_LABELS: Record<'ROCK' | 'PAPER' | 'SCISSORS', string> = { ROCK: 'Rock', PAPER: 'Paper', SCISSORS: 'Scissors' }

function deviatedTowardRock(extra: number): ProbabilityTriple {
  const rock = 1 / 3 + extra
  const remainder = (1 - rock) / 2
  return { ROCK: rock, PAPER: remainder, SCISSORS: remainder }
}

/**
 * A dedicated, scenario-driven explanation of the standard RPS Nash
 * equilibrium — deliberately not sharing the free-form editor state
 * from the Mixed Strategy Explorer tab, since the point here is to
 * walk through four specific, named comparisons side by side rather
 * than arbitrary distributions.
 */
export function NashEquilibriumExplorer() {
  const [scenario, setScenario] = useState<Scenario>('both_uniform')
  const [deviation, setDeviation] = useState(0.2)

  const { strategyA, strategyB } = useMemo<{ strategyA: ProbabilityTriple; strategyB: ProbabilityTriple }>(() => {
    switch (scenario) {
      case 'a_deviates':
        return { strategyA: deviatedTowardRock(deviation), strategyB: uniformStrategy() }
      case 'b_deviates':
        return { strategyA: uniformStrategy(), strategyB: deviatedTowardRock(deviation) }
      case 'both_biased':
        return { strategyA: DEFAULT_BIASED_DEMO_PROBABILITIES, strategyB: DEFAULT_BIASED_DEMO_PROBABILITIES }
      default:
        return { strategyA: uniformStrategy(), strategyB: uniformStrategy() }
    }
  }, [scenario, deviation])

  const verification = verifyEquilibrium(strategyA, strategyB)
  const valueA = expectedPayoffA(strategyA, strategyB)
  const uniformBaseline = expectedPayoffA(uniformStrategy(), uniformStrategy())
  const improved = valueA > uniformBaseline + 1e-9

  return (
    <div className="space-y-4">
      <Card title="The standard RPS Nash equilibrium">
        <p className="text-sm text-text-secondary">
          The equilibrium is <span className="font-mono text-text-primary">(1/3, 1/3, 1/3)</span> for both
          players, derived (not assumed) from the payoff matrix&apos;s symmetry under the cyclic relabeling
          Rock→Paper→Scissors→Rock — see docs/RPS_STRATEGY_ENGINE.md §5. Its game value is exactly{' '}
          <span className="font-mono text-text-primary">0</span>.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            {ACTIONS.map((a) => (
              <ProbabilityBar key={a} label={ACTION_LABELS[a]} probability={deriveUniformEquilibrium()[a]} />
            ))}
          </div>
          <p className="text-xs text-text-tertiary">
            Against this distribution, every pure action (Rock, Paper, <em>and</em> Scissors) earns the exact
            same expected payoff — 0 — because every row and column of the payoff matrix sums to 0. That is
            why no action is a strictly better response than the others: the best-response set is tied across
            all three.
          </p>
        </div>
      </Card>

      <Card title="Compare scenarios">
        <div role="radiogroup" aria-label="Nash equilibrium scenario" className="mb-4 flex flex-col gap-2">
          {SCENARIOS.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name="nash-scenario"
                value={s.id}
                checked={scenario === s.id}
                onChange={() => setScenario(s.id)}
              />
              {s.label}
            </label>
          ))}
        </div>

        {(scenario === 'a_deviates' || scenario === 'b_deviates') && (
          <label className="mb-4 block text-xs text-text-secondary">
            Deviation toward Rock: <span className="font-mono text-text-primary">{(deviation * 100).toFixed(0)}%</span>{' '}
            extra probability
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.01}
              value={deviation}
              onChange={(e) => setDeviation(Number(e.target.value))}
              aria-label="Deviation amount toward Rock"
              className="mt-1 h-2 w-full cursor-pointer accent-accent-violet"
            />
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-text-tertiary">Player A</p>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <ProbabilityBar key={a} label={ACTION_LABELS[a]} probability={strategyA[a]} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-text-tertiary">Player B</p>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <ProbabilityBar key={a} label={ACTION_LABELS[a]} probability={strategyB[a]} />
              ))}
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-text-tertiary">Player A expected payoff</dt>
            <dd className="font-display text-xl font-semibold text-accent-cyan">{valueA.toFixed(4)}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-tertiary">Is this pair a Nash equilibrium?</dt>
            <dd className={`font-display text-xl font-semibold ${verification.isEquilibrium ? 'text-state-success' : 'text-state-error'}`}>
              {verification.isEquilibrium ? 'Yes' : 'No'}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-text-secondary">
          {scenario === 'both_uniform' &&
            'Both players are at the equilibrium: neither can improve their expected payoff by unilaterally switching to any other strategy.'}
          {scenario === 'a_deviates' &&
            (improved
              ? 'Unexpected: this deviation appears to have improved the payoff — check the deviation amount.'
              : "Player A deviated from uniform, but Player B is still playing uniform. Because every row of the payoff matrix sums to 0, Player A's expected payoff against a uniform opponent is exactly 0 no matter what Player A plays — deviating neither helps nor hurts here. (It does, however, make Player A exploitable if Player B later adapts — see the Exploitability tab.)")}
          {scenario === 'b_deviates' &&
            "Player B deviated from uniform, but Player A is still playing uniform. By the same symmetric argument (every column also sums to 0), Player B's expected payoff is exactly 0 regardless of this deviation — no unilateral improvement is possible against a uniform opponent."}
          {scenario === 'both_biased' &&
            'Both players deviated together to the same biased (70/20/10) distribution. Unlike the one-sided cases above, this is a real computed result, not guaranteed to be 0 — see the number above.'}
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          Nash equilibrium describes <strong>strategic stability</strong> — no unilateral deviation improves
          expected payoff — not a guarantee of winning any individual round. The AI can still lose a given
          round while playing the equilibrium strategy; what it guarantees is that, in expectation, no fixed
          opponent can exploit it.
        </p>
      </Card>
    </div>
  )
}
