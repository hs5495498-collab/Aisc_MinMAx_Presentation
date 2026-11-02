import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { TutorialLayout, type Lesson } from '@/components/learning/TutorialLayout'
import { KnowledgeCheck } from '@/components/learning/KnowledgeCheck'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { learningRoutes } from '@/lib/routes'

const lessons: Lesson[] = [
  { id: 'adversarial', title: 'What is adversarial search?' },
  { id: 'game-trees', title: 'Game trees' },
  { id: 'max-min', title: 'MAX & MIN nodes' },
  { id: 'scoring', title: 'Scoring & depth' },
  { id: 'example', title: 'Worked example' },
]

export function MinimaxTutorialPage() {
  const route = learningRoutes[0]
  const [activeId, setActiveId] = useState(lessons[0].id)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  return (
    <PageContainer route={route}>
      <SectionSubNav items={learningRoutes} />
      <TutorialLayout
        lessons={lessons}
        activeId={activeId}
        completedIds={completed}
        onSelect={setActiveId}
      >
        {activeId === 'adversarial' && (
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              Adversarial search models games where two players have opposing goals: one tries to
              maximize an outcome, the other to minimize it. Tic-Tac-Toe is a <strong>perfect-information</strong>{' '}
              game — both players always know the full board state — which is exactly what makes
              Minimax applicable.
            </p>
          </div>
        )}
        {activeId === 'game-trees' && (
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              A game tree represents every possible sequence of moves from the current position.
              Each node is a board state; each edge is a move. The example below is illustrative,
              not a real search.
            </p>
            <GraphCanvas illustrative />
          </div>
        )}
        {activeId === 'max-min' && (
          <div className="space-y-4 text-sm text-text-secondary">
            <p>
              At a <strong>MAX</strong> node, the algorithm picks the child with the highest value
              (it's the AI's own turn). At a <strong>MIN</strong> node, it picks the child with the
              lowest value (the opponent's turn) — the opponent is assumed to play optimally against
              the AI too.
            </p>
            <KnowledgeCheck
              question="At a MIN node, which child does Minimax choose?"
              options={['The child with the highest value', 'The child with the lowest value', 'A random child']}
              correctIndex={1}
              explanation="MIN represents the opponent, who is assumed to minimize the AI's score."
              onCorrect={() => setCompleted((prev) => new Set(prev).add('max-min'))}
            />
          </div>
        )}
        {activeId === 'scoring' && (
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              Terminal states score <code className="rounded-sm bg-black/30 px-1.5 py-0.5 font-mono text-xs">+10 − depth</code>{' '}
              for an AI win, <code className="rounded-sm bg-black/30 px-1.5 py-0.5 font-mono text-xs">depth − 10</code>{' '}
              for a loss, and <code className="rounded-sm bg-black/30 px-1.5 py-0.5 font-mono text-xs">0</code> for a
              draw. Subtracting depth rewards winning sooner and losing later.
            </p>
          </div>
        )}
        {activeId === 'example' && (
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              A full worked example, backed by a real recorded search, will appear here once the
              Minimax engine ships (Phase 5) and can be stepped through directly in this lesson.
            </p>
          </div>
        )}
      </TutorialLayout>
    </PageContainer>
  )
}
