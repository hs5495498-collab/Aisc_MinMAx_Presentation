import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { Card } from '@/components/ui/Card'
import { PayoffMatrixGrid } from '@/components/rps/PayoffMatrixGrid'
import { ProbabilityBar } from '@/components/rps/ProbabilityBar'
import { EducationalVariantBanner } from '@/components/feedback/EducationalVariantBanner'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { labRoutes } from '@/lib/routes'

type Strategy = 'nash_uniform' | 'biased_fixed' | 'pattern_adaptive'

const distributions: Record<Strategy, { rock: number; paper: number; scissors: number }> = {
  nash_uniform: { rock: 1 / 3, paper: 1 / 3, scissors: 1 / 3 },
  biased_fixed: { rock: 0.5, paper: 0.3, scissors: 0.2 },
  pattern_adaptive: { rock: 0.3, paper: 0.4, scissors: 0.3 },
}

export function RPSMatrixPage() {
  const route = labRoutes[3]
  const [strategy, setStrategy] = useState<Strategy>('nash_uniform')
  const dist = distributions[strategy]
  const isEquilibrium = strategy === 'nash_uniform'

  return (
    <PageContainer route={route}>
      <SectionSubNav items={labRoutes} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card title="Payoff Matrix">
          <PayoffMatrixGrid />
          <p className="mt-3 text-xs text-text-tertiary">
            Hover or focus a cell for its outcome. This is the mathematically correct, static
            zero-sum payoff matrix for standard Rock Paper Scissors — see docs/GAME_THEORY_DESIGN.md.
          </p>
        </Card>

        <Card title="Mixed-Strategy Distribution">
          <label className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
            Strategy
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as Strategy)}
              className="rounded-md border border-surface-card-border bg-black/20 px-2 py-1.5 text-sm text-text-primary"
            >
              <option value="nash_uniform">Nash (uniform)</option>
              <option value="biased_fixed">Biased (fixed)</option>
              <option value="pattern_adaptive">Pattern-adaptive</option>
            </select>
          </label>
          <div className="space-y-3">
            <ProbabilityBar label="Rock" probability={dist.rock} />
            <ProbabilityBar label="Paper" probability={dist.paper} />
            <ProbabilityBar label="Scissors" probability={dist.scissors} />
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Expected value against this distribution:{' '}
            <strong className="text-text-primary">{isEquilibrium ? '0 (fair game)' : 'non-zero — exploitable'}</strong>
          </p>
          {!isEquilibrium && (
            <p className="mt-1 text-xs text-state-warning">
              This distribution deviates from 1/3-1/3-1/3, so it is no longer the Nash equilibrium
              and can be exploited by a well-chosen counter-strategy.
            </p>
          )}
        </Card>
      </div>

      <Card title="Why 1/3, 1/3, 1/3?" className="mb-6">
        <p className="text-sm text-text-secondary">
          The payoff matrix is invariant under the cyclic relabeling Rock → Paper → Scissors → Rock,
          so any equilibrium must be too — which forces equal probability on all three options. At{' '}
          <code className="rounded-sm bg-black/30 px-1.5 py-0.5 font-mono text-xs">(1/3, 1/3, 1/3)</code>,
          every pure response yields the same expected payoff (0), so neither player can profit by
          deviating. Full derivation in the project's{' '}
          <span className="font-mono text-xs text-text-tertiary">docs/GAME_THEORY_DESIGN.md</span> and
          the <Link className="text-accent-cyan hover:underline" to="/learn/game-theory">RPS Game Theory tutorial</Link>.
        </p>
      </Card>

      <EducationalVariantBanner>
        <p className="mb-3">
          Standard simultaneous Rock Paper Scissors is <strong>not</strong> solved by alternating-turn
          Alpha-Beta — there is no second mover with information to search over. This panel instead
          demonstrates Alpha-Beta mechanics on an artificial variant where Player 1's choice is
          revealed first, turning it into a small sequential game purely for teaching purposes.
        </p>
        <GraphCanvas illustrative />
      </EducationalVariantBanner>
    </PageContainer>
  )
}
