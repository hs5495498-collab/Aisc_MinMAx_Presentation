import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { TutorialLayout, type Lesson } from '@/components/learning/TutorialLayout'
import { KnowledgeCheck } from '@/components/learning/KnowledgeCheck'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { learningRoutes } from '@/lib/routes'

const lessons: Lesson[] = [
  { id: 'why-prune', title: 'Why prune a Minimax tree?' },
  { id: 'alpha-beta-defined', title: 'Alpha and Beta, defined' },
  { id: 'pruning-condition', title: 'The pruning condition (α ≥ β)' },
  { id: 'ordering', title: 'Move ordering and why it matters' },
  { id: 'worked-example', title: 'Worked example: ordered vs. unordered' },
]

export function AlphaBetaTutorialPage() {
  const route = learningRoutes[1]
  const [activeId, setActiveId] = useState(lessons[0].id)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  return (
    <PageContainer route={route}>
      <SectionSubNav items={learningRoutes} />
      <TutorialLayout lessons={lessons} activeId={activeId} completedIds={completed} onSelect={setActiveId}>
        {activeId === 'why-prune' && (
          <p className="text-sm text-text-secondary">
            Minimax visits every node in the tree, even ones that could never affect the final
            decision. Alpha-Beta Pruning skips those branches while guaranteeing the exact same move
            choice as plain Minimax.
          </p>
        )}
        {activeId === 'alpha-beta-defined' && (
          <p className="text-sm text-text-secondary">
            <strong>Alpha</strong> is the best value MAX can guarantee so far along the current path;{' '}
            <strong>Beta</strong> is the best value MIN can guarantee so far. Both update as the
            search descends and backtracks.
          </p>
        )}
        {activeId === 'pruning-condition' && (
          <div className="space-y-4 text-sm text-text-secondary">
            <p>
              A branch is pruned the moment <code className="rounded-sm bg-black/30 px-1.5 py-0.5 font-mono text-xs">alpha ≥ beta</code>{' '}
              — the opposing player would never allow play to reach it.
            </p>
            <GraphCanvas illustrative />
            <KnowledgeCheck
              question="A branch is pruned when:"
              options={['alpha < beta', 'alpha ≥ beta', 'The branch is deeper than 3 moves']}
              correctIndex={1}
              explanation="Once alpha ≥ beta, the opponent would steer play away from this branch, so exploring it further can't change the outcome."
              onCorrect={() => setCompleted((prev) => new Set(prev).add('pruning-condition'))}
            />
          </div>
        )}
        {activeId === 'ordering' && (
          <p className="text-sm text-text-secondary">
            Pruning correctness doesn't depend on move order, but pruning <strong>efficiency</strong> does
            — visiting likely-strong moves first (e.g. center, then corners, then edges in Tic-Tac-Toe)
            triggers the α ≥ β condition earlier, pruning more nodes for the same final answer.
          </p>
        )}
        {activeId === 'worked-example' && (
          <p className="text-sm text-text-secondary">
            A side-by-side node-count comparison, backed by a real search, will appear here once the
            engine ships (Phase 6) — see the Alpha-Beta Explorer and Search Tree Lab for the live
            workspace this lesson will connect to.
          </p>
        )}
      </TutorialLayout>
    </PageContainer>
  )
}
