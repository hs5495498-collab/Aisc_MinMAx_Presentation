import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import { ProbabilityInputGroup } from './ProbabilityInputGroup'
import type { UseRpsStrategyLabReturn } from '@/hooks/useRpsStrategyLab'
import {
  DEFAULT_BIASED_DEMO_PROBABILITIES,
} from '@/lib/rpsEngine'
import { expectedPayoffA, expectedPayoffB, expectedPayoffContributions, pureStrategy, uniformStrategy } from '@/lib/rpsGameTheory'
import type { ProbabilityTriple } from '@/types/rps'

const ACTION_LABELS: Record<'ROCK' | 'PAPER' | 'SCISSORS', string> = { ROCK: 'Rock', PAPER: 'Paper', SCISSORS: 'Scissors' }

function PresetButtons({ onLoad, who }: { onLoad: (p: ProbabilityTriple) => void; who: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onLoad(uniformStrategy())}>
        Load uniform equilibrium
      </Button>
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onLoad(pureStrategy('ROCK'))}>
        Pure Rock
      </Button>
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onLoad(pureStrategy('PAPER'))}>
        Pure Paper
      </Button>
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onLoad(pureStrategy('SCISSORS'))}>
        Pure Scissors
      </Button>
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onLoad(DEFAULT_BIASED_DEMO_PROBABILITIES)}>
        Biased demo (70/20/10)
      </Button>
      <span className="sr-only">for {who}</span>
    </div>
  )
}

/**
 * The live `U(p, q) = pᵀ A q` calculator. Reads and writes the same
 * shared `playerA`/`playerB` state as every other tab — this is a
 * view onto one shared pair of strategies, not an independent copy,
 * so edits here are visible in the Mixed Strategy Explorer tab too.
 */
export function ExpectedPayoffCalculator({ playerA, playerB, bothValid }: UseRpsStrategyLabReturn) {
  const payoffA = bothValid ? expectedPayoffA(playerA.value, playerB.value) : null
  const payoffB = bothValid ? expectedPayoffB(playerA.value, playerB.value) : null
  const contributions = bothValid ? expectedPayoffContributions(playerA.value, playerB.value) : []

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Player A's strategy (p)">
          <PresetButtons who="Player A" onLoad={playerA.set} />
          <div className="mt-3">
            <ProbabilityInputGroup
              label="Player A"
              value={playerA.value}
              error={playerA.error}
              onChange={playerA.set}
              onReset={playerA.reset}
              onNormalize={playerA.normalize}
            />
          </div>
        </Card>
        <Card title="Player B's strategy (q)">
          <PresetButtons who="Player B" onLoad={playerB.set} />
          <div className="mt-3">
            <ProbabilityInputGroup
              label="Player B"
              value={playerB.value}
              error={playerB.error}
              onChange={playerB.set}
              onReset={playerB.reset}
              onNormalize={playerB.normalize}
            />
          </div>
        </Card>
      </div>

      <Card title="Expected payoff — U(p, q) = pᵀ A q">
        {!bothValid ? (
          <p className="text-sm text-state-warning">
            Fix the invalid distribution above to see the expected payoff.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-text-tertiary">Player A expected payoff</dt>
                <dd className="font-display text-xl font-semibold text-accent-cyan">{payoffA!.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Player B expected payoff</dt>
                <dd className="font-display text-xl font-semibold text-accent-magenta">{payoffB!.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Sum (zero-sum check)</dt>
                <dd className="font-display text-xl font-semibold text-text-primary">
                  {(payoffA! + payoffB!).toFixed(6)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-text-tertiary">
              Player A and Player B&apos;s expected payoffs always sum to 0 — standard RPS is a zero-sum game,
              so one side&apos;s expected gain is exactly the other side&apos;s expected loss.
            </p>

            <h4 className="mt-5 mb-2 text-sm font-semibold text-text-primary">Contribution from each action pairing</h4>
            <ComparisonBarChart
              valueLabel="Contribution to A's expected payoff"
              data={contributions.map((c) => ({
                name: `${ACTION_LABELS[c.actionA]}/${ACTION_LABELS[c.actionB]}`,
                value: c.contributionA,
              }))}
            />
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="py-1 pr-3">Player A</th>
                  <th className="py-1 pr-3">Player B</th>
                  <th className="py-1 pr-3">P(pairing)</th>
                  <th className="py-1 pr-3">Payoff (A)</th>
                  <th className="py-1">Contribution</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {contributions.map((c) => (
                  <tr key={`${c.actionA}-${c.actionB}`} className="border-t border-surface-card-border/60">
                    <td className="py-1 pr-3">{ACTION_LABELS[c.actionA]}</td>
                    <td className="py-1 pr-3">{ACTION_LABELS[c.actionB]}</td>
                    <td className="py-1 pr-3 font-mono">{c.probability.toFixed(4)}</td>
                    <td className="py-1 pr-3 font-mono">{c.payoffA}</td>
                    <td className="py-1 font-mono">{c.contributionA.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm font-medium text-text-primary">
              Total expected payoff (Player A): {payoffA!.toFixed(4)} — the sum of the Contribution column above.
            </p>
          </>
        )}
      </Card>

      <Card title="Worked example">
        <p className="text-sm text-text-secondary">
          Player A plays (0.5 Rock, 0.5 Paper, 0 Scissors); Player B plays (0 Rock, 0.5 Paper, 0.5 Scissors).
          The only pairings with non-zero probability are Rock/Paper (0.25, payoff -1), Rock/Scissors (0.25,
          payoff +1), Paper/Paper (0.25, payoff 0), and Paper/Scissors (0.25, payoff -1) — contributing
          -0.25, +0.25, 0, and -0.25. Summed: Player A&apos;s expected payoff is exactly{' '}
          <span className="font-mono text-text-primary">-0.25</span>, and Player B&apos;s is{' '}
          <span className="font-mono text-text-primary">+0.25</span>. Load this into the calculator above with
          the button below to see the live breakdown match.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 text-xs"
          onClick={() => {
            playerA.set({ ROCK: 0.5, PAPER: 0.5, SCISSORS: 0 })
            playerB.set({ ROCK: 0, PAPER: 0.5, SCISSORS: 0.5 })
          }}
        >
          Load this worked example
        </Button>
      </Card>
    </div>
  )
}
