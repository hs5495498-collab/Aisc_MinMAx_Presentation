import type { MatchConfig, MatchStatus, Score } from '@/types/rps'
import { winThreshold } from '@/lib/rpsEngine'

interface ScoreboardPanelProps {
  score: Score
  config: MatchConfig
  status: MatchStatus
}

export function ScoreboardPanel({ score, config, status }: ScoreboardPanelProps) {
  const threshold = winThreshold(config.bestOf)
  const roundsPlayed = score.playerWins + score.aiWins + score.ties
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
      <Stat label="Your wins" value={score.playerWins} tone="text-accent-cyan" />
      <Stat label="AI wins" value={score.aiWins} tone="text-graph-node-min" />
      <Stat label="Ties" value={score.ties} tone="text-text-tertiary" />
      <Stat label="Rounds played" value={roundsPlayed} />
      <Stat label="Wins required" value={threshold} />
      <Stat label="Status" value={status === 'COMPLETE' ? 'Complete' : 'In progress'} />
    </dl>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className={`font-display text-xl font-semibold ${tone ?? 'text-text-primary'}`}>{value}</dd>
    </div>
  )
}
