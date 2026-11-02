import { useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { learningRoutes } from '@/lib/routes'
import { vivaQuestions } from './vivaQuestions'
import { HelpCircle } from 'lucide-react'

type TopicFilter = 'All' | 'Minimax' | 'Alpha-Beta' | 'RPS Theory'
type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced'

export function VivaPreparationPage() {
  const route = learningRoutes[3]
  const [topic, setTopic] = useState<TopicFilter>('All')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState({ attempted: 0 })

  const pool = useMemo(
    () =>
      vivaQuestions.filter(
        (q) => (topic === 'All' || q.topic === topic) && (difficulty === 'All' || q.difficulty === difficulty),
      ),
    [topic, difficulty],
  )
  const current = pool[index % Math.max(pool.length, 1)]

  function reveal() {
    setRevealed(true)
    setScore((s) => ({ attempted: s.attempted + 1 }))
  }

  function next() {
    setIndex((i) => i + 1)
    setRevealed(false)
    setAnswer('')
  }

  return (
    <PageContainer route={route} actions={<Badge tone="neutral">Session attempts: {score.attempted}</Badge>}>
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as DifficultyFilter)
            setIndex(0)
            setRevealed(false)
          }}
          aria-label="Difficulty"
          className="rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary"
        >
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value as TopicFilter)
            setIndex(0)
            setRevealed(false)
          }}
          aria-label="Topic"
          className="rounded-md border border-surface-card-border bg-black/20 px-3 py-2 text-sm text-text-primary"
        >
          {(['All', 'Minimax', 'Alpha-Beta', 'RPS Theory'] as const).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {!current ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions match these filters"
          message="Try widening the topic or difficulty filter."
        />
      ) : (
        <Card className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="violet">{current.topic}</Badge>
            <Badge tone="neutral">{current.difficulty}</Badge>
          </div>
          <p className="mb-4 text-base font-medium text-text-primary">{current.question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            rows={3}
            aria-label="Your answer"
            className="mb-3 w-full rounded-md border border-surface-card-border bg-black/20 p-3 text-sm text-text-primary placeholder:text-text-tertiary"
          />
          {!revealed ? (
            <Button onClick={reveal}>Reveal Model Answer</Button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border border-accent-cyan/30 bg-accent-cyan/5 p-3 text-sm text-text-secondary">
                <p className="mb-1 font-medium text-text-primary">Model answer</p>
                <p>{current.modelAnswer}</p>
              </div>
              <Button variant="secondary" onClick={next}>
                Next Question →
              </Button>
            </div>
          )}
        </Card>
      )}
    </PageContainer>
  )
}
