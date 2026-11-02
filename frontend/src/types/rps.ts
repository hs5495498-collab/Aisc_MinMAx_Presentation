/**
 * Types for the Phase 9 Rock Paper Scissors gameplay demo.
 *
 * This is a **frontend demonstration mirror** of the real Python
 * engine at `backend/app/games/rock_paper_scissors/{match.py,
 * ai_strategies.py}` — same payoff rules, same two-step lock/resolve
 * sequence, same validation, same win-threshold formula. It is not
 * the real engine and is not wired to it (no backend API exists
 * yet — see docs/RPS_GAMEPLAY.md "Phase 12 API Integration
 * Boundary"). Every page built on this is labeled as a demo for
 * exactly that reason.
 */

export type Action = 'ROCK' | 'PAPER' | 'SCISSORS'

export const ACTIONS: readonly Action[] = ['ROCK', 'PAPER', 'SCISSORS']

export type AIStrategyKind = 'NASH_UNIFORM' | 'RANDOM_UNIFORM' | 'CUSTOM' | 'BIASED_DEMO'

export interface ProbabilityTriple {
  ROCK: number
  PAPER: number
  SCISSORS: number
}

export interface AIStrategyConfig {
  kind: AIStrategyKind
  /** Required and validated iff kind === 'CUSTOM'. */
  customProbabilities?: ProbabilityTriple
  /** Optional override for BIASED_DEMO; defaults to 70/20/10. */
  biasedDemoProbabilities?: ProbabilityTriple
}

export type RoundResult = 'PLAYER_WIN' | 'AI_WIN' | 'TIE'

export interface Score {
  playerWins: number
  aiWins: number
  ties: number
}

export interface RoundRecord {
  roundNumber: number
  playerAction: Action
  aiAction: Action
  result: RoundResult
  scoreAfter: Score
}

export type MatchStatus = 'AWAITING_PLAYER_MOVE' | 'COMPLETE'
export type MatchWinner = 'PLAYER' | 'AI'

export interface MatchConfig {
  bestOf: number
  aiStrategy: AIStrategyConfig
}
