import type { RoundRecord } from '@/types/rps'

export function MatchHistoryList({ history }: { history: readonly RoundRecord[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-text-tertiary">No rounds played yet.</p>
  }

  return (
    <ol className="max-h-64 space-y-1.5 overflow-y-auto text-sm text-text-secondary" aria-label="Match history">
      {[...history].reverse().map((round) => (
        <li
          key={round.roundNumber}
          className="flex items-center justify-between gap-2 rounded-sm border border-surface-card-border px-2.5 py-1.5"
        >
          <span className="font-mono text-xs text-text-tertiary">R{round.roundNumber}</span>
          <span>
            {round.playerAction} <span className="text-text-tertiary">vs</span> {round.aiAction}
          </span>
          <span
            className={
              round.result === 'PLAYER_WIN'
                ? 'text-state-success'
                : round.result === 'AI_WIN'
                  ? 'text-state-error'
                  : 'text-state-warning'
            }
          >
            {round.result === 'PLAYER_WIN' ? 'Win' : round.result === 'AI_WIN' ? 'Loss' : 'Tie'}
          </span>
          <span className="font-mono text-xs text-text-tertiary">
            {round.scoreAfter.playerWins}-{round.scoreAfter.aiWins}-{round.scoreAfter.ties}
          </span>
        </li>
      ))}
    </ol>
  )
}
