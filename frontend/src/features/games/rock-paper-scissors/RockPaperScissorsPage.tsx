import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { ChoicesPanel } from '@/components/rps/gameplay/ChoicesPanel'
import { RoundRevealPanel } from '@/components/rps/gameplay/RoundRevealPanel'
import { ScoreboardPanel } from '@/components/rps/gameplay/ScoreboardPanel'
import { MatchHistoryList } from '@/components/rps/gameplay/MatchHistoryList'
import { AIStrategyPanel } from '@/components/rps/gameplay/AIStrategyPanel'
import { MatchConfigPanel } from '@/components/rps/gameplay/MatchConfigPanel'
import { FinalResultScreen } from '@/components/rps/gameplay/FinalResultScreen'
import { useRpsMatch } from '@/hooks/useRpsMatch'
import { gameRoutes, labRoutes } from '@/lib/routes'
import type { AIStrategyConfig } from '@/types/rps'

const DEFAULT_CONFIG = { bestOf: 5, aiStrategy: { kind: 'NASH_UNIFORM' } as AIStrategyConfig }

export function RockPaperScissorsPage() {
  const route = gameRoutes[1]
  const match = useRpsMatch(DEFAULT_CONFIG)
  const matchStarted = match.history.length > 0

  const handleStrategyChange = (aiStrategy: AIStrategyConfig) => {
    match.startNewMatch({ ...match.config, aiStrategy })
  }

  const handleBestOfChange = (bestOf: number) => {
    match.startNewMatch({ ...match.config, bestOf })
  }

  return (
    <PageContainer
      route={route}
      actions={
        <Badge tone="warning">
          Frontend demo — mirrors the real Python match engine, not yet connected via an API (Phase 12)
        </Badge>
      }
    >
      <SectionSubNav items={gameRoutes} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            {match.error && <ErrorState message={match.error} />}

            {match.status === 'COMPLETE' && match.winner ? (
              <FinalResultScreen
                winner={match.winner}
                score={match.score}
                config={match.config}
                onNewMatch={() => match.startNewMatch()}
              />
            ) : (
              <div className="space-y-6">
                <ScoreboardPanel score={match.score} config={match.config} status={match.status} />
                <RoundRevealPanel
                  phase={match.phase}
                  pendingPlayerAction={match.pendingPlayerAction}
                  lastRound={match.lastRound}
                />
                {match.phase === 'revealed' ? (
                  <div className="flex justify-center">
                    <Button onClick={match.nextRound}>Next Round</Button>
                  </div>
                ) : (
                  <ChoicesPanel
                    phase={match.phase}
                    pendingPlayerAction={match.pendingPlayerAction}
                    disabled={match.status === 'COMPLETE'}
                    onSelect={match.selectAction}
                  />
                )}
              </div>
            )}
          </Card>

          <Card title="Match History">
            <MatchHistoryList history={match.history} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Match Configuration">
            <MatchConfigPanel bestOf={match.config.bestOf} onChange={handleBestOfChange} disabled={matchStarted} />
            {matchStarted && (
              <p className="mt-2 text-xs text-text-tertiary">
                Configuration is locked once a match is in progress — start a new match to change it.
              </p>
            )}
          </Card>

          <Card title="AI Opponent">
            <AIStrategyPanel value={match.config.aiStrategy} onChange={handleStrategyChange} disabled={matchStarted} />
          </Card>

          <Card title="Game Theory">
            <p className="text-sm text-text-secondary">
              Standard Rock Paper Scissors is a simultaneous-action game — the AI&apos;s choice is sampled only
              after your move is locked in, and is never revealed early.
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
