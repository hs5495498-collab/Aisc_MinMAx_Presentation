import { AnimatePresence, motion } from 'framer-motion'
import { Hand, FileText, HelpCircle, Scissors as ScissorsIcon } from 'lucide-react'
import type { Action, RoundRecord } from '@/types/rps'
import type { RoundPhase } from '@/hooks/useRpsMatch'
import { explainRoundResult } from '@/lib/rpsEngine'

const ICONS: Record<Action, typeof Hand> = { ROCK: Hand, PAPER: FileText, SCISSORS: ScissorsIcon }

interface RoundRevealPanelProps {
  phase: RoundPhase
  pendingPlayerAction: Action | null
  lastRound: RoundRecord | null
}

/**
 * Shows the player's own locked choice immediately, but the AI's side
 * stays a "?" placeholder for the entire `resolving` phase — the AI's
 * actual action only exists once `resolvePendingRound()` has run (see
 * `useRpsMatch`), so there is nothing to reveal early even if we
 * wanted to.
 */
export function RoundRevealPanel({ phase, pendingPlayerAction, lastRound }: RoundRevealPanelProps) {
  if (phase === 'idle' && !lastRound) {
    return <p className="text-center text-sm text-text-tertiary">Pick Rock, Paper, or Scissors to begin.</p>
  }

  const playerAction = phase === 'idle' ? lastRound?.playerAction ?? null : pendingPlayerAction
  const revealedAiAction = phase === 'revealed' ? lastRound?.aiAction ?? null : null
  const PlayerIcon = playerAction ? ICONS[playerAction] : HelpCircle
  const AiIcon = revealedAiAction ? ICONS[revealedAiAction] : HelpCircle

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-8">
        <RevealSlot label="You" icon={PlayerIcon} known={playerAction !== null} tone="text-accent-cyan" />
        <span className="font-display text-2xl text-text-tertiary">VS</span>
        <RevealSlot
          label="AI"
          icon={AiIcon}
          known={revealedAiAction !== null}
          tone="text-graph-node-min"
          spinning={phase === 'resolving'}
        />
      </div>

      <AnimatePresence>
        {phase === 'resolving' && (
          <motion.p
            key="resolving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-text-tertiary"
          >
            Revealing…
          </motion.p>
        )}
        {phase === 'revealed' && lastRound && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              className={`font-display text-lg font-semibold ${
                lastRound.result === 'PLAYER_WIN'
                  ? 'text-state-success'
                  : lastRound.result === 'AI_WIN'
                    ? 'text-state-error'
                    : 'text-state-warning'
              }`}
            >
              {explainRoundResult(lastRound)}
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Score: You {lastRound.scoreAfter.playerWins} — AI {lastRound.scoreAfter.aiWins} — Ties{' '}
              {lastRound.scoreAfter.ties}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RevealSlot({
  label,
  icon: Icon,
  known,
  tone,
  spinning = false,
}: {
  label: string
  icon: typeof Hand
  known: boolean
  tone: string
  spinning?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { repeat: Infinity, duration: 1, ease: 'linear' } : undefined}
        className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
          known ? 'border-current' : 'border-dashed border-surface-card-border'
        } ${known ? tone : 'text-text-tertiary'}`}
      >
        <Icon size={36} />
      </motion.div>
      <span className="text-xs text-text-tertiary">{label}</span>
    </div>
  )
}
