import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { TutorialLayout, type Lesson } from '@/components/learning/TutorialLayout'
import { KnowledgeCheck } from '@/components/learning/KnowledgeCheck'
import { PayoffMatrixGrid } from '@/components/rps/PayoffMatrixGrid'
import { ProbabilityBar } from '@/components/rps/ProbabilityBar'
import { learningRoutes } from '@/lib/routes'

const lessons: Lesson[] = [
  { id: 'sequential-vs-simultaneous', title: 'Sequential vs. simultaneous games' },
  { id: 'payoff-matrices', title: 'Zero-sum payoff matrices' },
  { id: 'pure-vs-mixed', title: 'Pure vs. mixed strategies' },
  { id: 'deriving-equilibrium', title: 'Deriving the 1/3-1/3-1/3 equilibrium' },
  { id: 'exploitability', title: 'Exploitability' },
]

export function GameTheoryTutorialPage() {
  const route = learningRoutes[2]
  const [activeId, setActiveId] = useState(lessons[0].id)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  return (
    <PageContainer route={route}>
      <SectionSubNav items={learningRoutes} />
      <TutorialLayout lessons={lessons} activeId={activeId} completedIds={completed} onSelect={setActiveId}>
        {activeId === 'sequential-vs-simultaneous' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-surface-card-border p-4 text-sm text-text-secondary">
              <p className="mb-1 font-medium text-text-primary">Tic-Tac-Toe — sequential</p>
              <p>Players alternate turns with full knowledge of the board. This is exactly what Minimax/Alpha-Beta solve.</p>
            </div>
            <div className="rounded-md border border-surface-card-border p-4 text-sm text-text-secondary">
              <p className="mb-1 font-medium text-text-primary">Rock Paper Scissors — simultaneous</p>
              <p>Both players commit a choice without seeing the other's — there's no "second mover" to search over.</p>
            </div>
          </div>
        )}
        {activeId === 'payoff-matrices' && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              A zero-sum payoff matrix lists one player's payoff for every combination of choices;
              the other player's payoff is always the negation.
            </p>
            <PayoffMatrixGrid />
          </div>
        )}
        {activeId === 'pure-vs-mixed' && (
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              A <strong>pure strategy</strong> always plays the same choice — easily exploited in RPS.
              A <strong>mixed strategy</strong> plays a probability distribution over choices, which can
              make a player unexploitable if chosen correctly.
            </p>
            <KnowledgeCheck
              question="Why does RPS have no pure-strategy equilibrium?"
              options={[
                'Because the game has three options',
                'Because any fixed choice is beaten by a specific counter-choice',
                'Because the game is sequential',
              ]}
              correctIndex={1}
              explanation="Whatever you always play, your opponent can always counter it once they notice — so no fixed choice is stable."
              onCorrect={() => setCompleted((prev) => new Set(prev).add('pure-vs-mixed'))}
            />
          </div>
        )}
        {activeId === 'deriving-equilibrium' && (
          <div className="space-y-4 text-sm text-text-secondary">
            <p>
              The payoff matrix is unchanged under the cyclic relabeling Rock→Paper→Scissors→Rock, so
              any equilibrium must be too — forcing equal probability on all three.
            </p>
            <div className="space-y-2">
              <ProbabilityBar label="Rock" probability={1 / 3} />
              <ProbabilityBar label="Paper" probability={1 / 3} />
              <ProbabilityBar label="Scissors" probability={1 / 3} />
            </div>
            <p>At this distribution, every pure response has expected value exactly 0.</p>
          </div>
        )}
        {activeId === 'exploitability' && (
          <p className="text-sm text-text-secondary">
            Deviating from 1/3-1/3-1/3 opens you up to exploitation: an opponent who notices the bias
            and best-responds to it earns a strictly positive expected payoff. Try it yourself in the{' '}
            <strong>RPS Strategy Matrix</strong> by switching to the biased or pattern-adaptive strategy.
          </p>
        )}
      </TutorialLayout>
    </PageContainer>
  )
}
