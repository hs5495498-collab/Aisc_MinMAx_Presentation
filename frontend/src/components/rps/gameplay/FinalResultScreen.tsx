import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MatchConfig, MatchWinner, Score } from '@/types/rps'
import { explainAiStrategy } from '@/lib/rpsEngine'

interface FinalResultScreenProps {
  winner: MatchWinner
  score: Score
  config: MatchConfig
  onNewMatch: () => void
}

export function FinalResultScreen({ winner, score, config, onNewMatch }: FinalResultScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <Trophy size={40} className={winner === 'PLAYER' ? 'text-accent-cyan' : 'text-graph-node-min'} />
      <h2 className="font-display text-2xl font-bold text-text-primary">
        {winner === 'PLAYER' ? 'You won the match!' : 'The AI won the match.'}
      </h2>
      <dl className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <dt className="text-text-tertiary">Your score</dt>
          <dd className="font-display text-xl font-semibold text-accent-cyan">{score.playerWins}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">AI score</dt>
          <dd className="font-display text-xl font-semibold text-graph-node-min">{score.aiWins}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Ties</dt>
          <dd className="font-display text-xl font-semibold text-text-tertiary">{score.ties}</dd>
        </div>
      </dl>
      <p className="text-xs text-text-tertiary">
        Best of {config.bestOf} · Total rounds played: {score.playerWins + score.aiWins + score.ties}
      </p>
      <p className="max-w-md text-xs text-text-tertiary">AI strategy: {explainAiStrategy(config.aiStrategy)}</p>
      <Button onClick={onNewMatch}>New Match</Button>
    </motion.div>
  )
}
