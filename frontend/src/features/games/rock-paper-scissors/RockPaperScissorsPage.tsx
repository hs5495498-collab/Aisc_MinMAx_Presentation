import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hand, FileText, Scissors as ScissorsIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { gameRoutes, labRoutes } from '@/lib/routes'

type Choice = 'ROCK' | 'PAPER' | 'SCISSORS'
type Result = 'human_win' | 'opponent_win' | 'tie'

const choices: { value: Choice; label: string; icon: typeof Hand }[] = [
  { value: 'ROCK', label: 'Rock', icon: Hand },
  { value: 'PAPER', label: 'Paper', icon: FileText },
  { value: 'SCISSORS', label: 'Scissors', icon: ScissorsIcon },
]

function resolve(human: Choice, opponent: Choice): Result {
  if (human === opponent) return 'tie'
  const beats: Record<Choice, Choice> = { ROCK: 'SCISSORS', PAPER: 'ROCK', SCISSORS: 'PAPER' }
  return beats[human] === opponent ? 'human_win' : 'opponent_win'
}

/** Picks uniformly at random — a placeholder, NOT the Nash-equilibrium strategy engine. */
function pickDemoOpponentChoice(): Choice {
  const options: Choice[] = ['ROCK', 'PAPER', 'SCISSORS']
  return options[Math.floor(Math.random() * options.length)]
}

export function RockPaperScissorsPage() {
  const route = gameRoutes[1]
  const [bestOf, setBestOf] = useState(5)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState({ human: 0, opponent: 0, ties: 0 })
  const [rounds, setRounds] = useState<{ human: Choice; opponent: Choice; result: Result }[]>([])
  const [lastResult, setLastResult] = useState<{ human: Choice; opponent: Choice; result: Result } | null>(null)

  const winThreshold = Math.ceil(bestOf / 2)
  const matchComplete = score.human >= winThreshold || score.opponent >= winThreshold

  function play(human: Choice) {
    if (matchComplete) return
    const opponent = pickDemoOpponentChoice()
    const result = resolve(human, opponent)
    setLastResult({ human, opponent, result })
    setRounds((prev) => [...prev, { human, opponent, result }])
    setScore((s) => ({
      human: s.human + (result === 'human_win' ? 1 : 0),
      opponent: s.opponent + (result === 'opponent_win' ? 1 : 0),
      ties: s.ties + (result === 'tie' ? 1 : 0),
    }))
    setRound((r) => r + 1)
  }

  function restart() {
    setRound(1)
    setScore({ human: 0, opponent: 0, ties: 0 })
    setRounds([])
    setLastResult(null)
  }

  return (
    <PageContainer
      route={route}
      actions={<Badge tone="warning">Demo opponent picks randomly — not a Nash equilibrium strategy</Badge>}
    >
      <SectionSubNav items={gameRoutes} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Best of
          <select
            value={bestOf}
            onChange={(e) => {
              setBestOf(Number(e.target.value))
              restart()
            }}
            className="rounded-md border border-surface-card-border bg-black/20 px-2 py-1.5 text-sm text-text-primary"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </label>
        <span className="text-sm text-text-tertiary">Round {Math.min(round, bestOf)} of {bestOf}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Card>
            <div className="mb-5 flex justify-center gap-3">
              {score && (
                <p className="text-sm text-text-secondary">
                  You {score.human} — Opponent {score.opponent} — Ties {score.ties}
                </p>
              )}
            </div>
            {!matchComplete ? (
              <div className="flex flex-wrap justify-center gap-4">
                {choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => play(c.value)}
                    className="flex min-h-24 w-28 flex-col items-center justify-center gap-2 rounded-lg border border-surface-card-border bg-black/10 text-sm font-medium text-text-primary transition-all hover:-translate-y-0.5 hover:border-accent-magenta/40"
                    aria-label={c.label}
                  >
                    <c.icon size={28} className="text-accent-cyan" />
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-text-primary">
                  {score.human > score.opponent ? 'You won the match!' : 'Opponent won the match.'}
                </p>
                <Button variant="secondary" onClick={restart} className="mt-4">
                  Play Again
                </Button>
              </div>
            )}

            {lastResult && (
              <p className="mt-6 text-center text-sm text-text-secondary">
                You played <strong className="text-text-primary">{lastResult.human}</strong>, opponent played{' '}
                <strong className="text-text-primary">{lastResult.opponent}</strong> —{' '}
                <span
                  className={
                    lastResult.result === 'human_win'
                      ? 'text-state-success'
                      : lastResult.result === 'opponent_win'
                        ? 'text-state-error'
                        : 'text-state-warning'
                  }
                >
                  {lastResult.result === 'human_win' ? 'You win this round' : lastResult.result === 'opponent_win' ? 'Opponent wins this round' : 'Tie'}
                </span>
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Match History">
            {rounds.length === 0 ? (
              <p className="text-sm text-text-tertiary">No rounds played yet.</p>
            ) : (
              <ol className="max-h-48 space-y-1 overflow-y-auto text-sm text-text-secondary">
                {rounds.map((r, i) => (
                  <li key={i}>
                    R{i + 1}: {r.human} vs {r.opponent} —{' '}
                    {r.result === 'human_win' ? 'Win' : r.result === 'opponent_win' ? 'Loss' : 'Tie'}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Opponent Strategy (demo)">
            <p className="text-sm text-text-secondary">
              This placeholder opponent picks Rock, Paper, or Scissors uniformly at random. It
              happens to match the real Nash-equilibrium frequency (1/3 each), but it is{' '}
              <strong>not</strong> computing an equilibrium — the real strategy engine (including
              biased and pattern-adaptive opponents) arrives in Phase 8.
            </p>
            <Link to={labRoutes[3].path} className="mt-3 inline-block text-sm text-accent-cyan hover:underline">
              Open RPS Strategy Matrix →
            </Link>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
