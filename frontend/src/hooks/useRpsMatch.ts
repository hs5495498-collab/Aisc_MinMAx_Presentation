import { useCallback, useState } from 'react'
import type { Action, MatchConfig, MatchStatus, MatchWinner, RoundRecord, Score } from '@/types/rps'
import { RPSMatchEngine } from '@/lib/rpsEngine'

export type RoundPhase = 'idle' | 'resolving' | 'revealed'

const REVEAL_DELAY_MS = 650

/**
 * Drives one Rock Paper Scissors match using the frontend demo engine
 * (`RPSMatchEngine`). The ~650ms `resolving` phase is purely a UI
 * suspense beat — the AI's action is not sampled until
 * `resolvePendingRound()` actually runs inside that timeout, exactly
 * mirroring the backend's lock-then-resolve sequence: the player's
 * choice is already locked before the AI's action exists at all.
 */
export function useRpsMatch(initialConfig: MatchConfig) {
  const [engine] = useState(() => new RPSMatchEngine(initialConfig))

  const [score, setScore] = useState<Score>(engine.score)
  const [history, setHistory] = useState<readonly RoundRecord[]>(engine.history)
  const [status, setStatus] = useState<MatchStatus>(engine.status)
  const [winner, setWinner] = useState<MatchWinner | null>(engine.winner)
  const [phase, setPhase] = useState<RoundPhase>('idle')
  const [pendingPlayerAction, setPendingPlayerAction] = useState<Action | null>(null)
  const [lastRound, setLastRound] = useState<RoundRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncFromEngine = useCallback(() => {
    setScore(engine.score)
    setHistory(engine.history)
    setStatus(engine.status)
    setWinner(engine.winner)
  }, [engine])

  const selectAction = useCallback(
    (action: Action) => {
      if (phase !== 'idle' || status === 'COMPLETE') return
      setError(null)
      try {
        engine.lockPlayerMove(action)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not lock that move.')
        return
      }
      setPendingPlayerAction(action)
      setPhase('resolving')
      window.setTimeout(() => {
        try {
          const record = engine.resolvePendingRound()
          setLastRound(record)
          syncFromEngine()
          setPhase('revealed')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not resolve that round.')
          setPhase('idle')
          setPendingPlayerAction(null)
        }
      }, REVEAL_DELAY_MS)
    },
    [engine, phase, status, syncFromEngine],
  )

  const nextRound = useCallback(() => {
    setPhase('idle')
    setPendingPlayerAction(null)
  }, [])

  const startNewMatch = useCallback(
    (newConfig?: MatchConfig) => {
      try {
        engine.startNewMatch(newConfig)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start a new match with that configuration.')
        return
      }
      setPhase('idle')
      setPendingPlayerAction(null)
      setLastRound(null)
      setError(null)
      syncFromEngine()
    },
    [engine, syncFromEngine],
  )

  return {
    config: engine.config,
    score,
    history,
    status,
    winner,
    phase,
    pendingPlayerAction,
    lastRound,
    error,
    selectAction,
    nextRound,
    startNewMatch,
  }
}

export type UseRpsMatchReturn = ReturnType<typeof useRpsMatch>
