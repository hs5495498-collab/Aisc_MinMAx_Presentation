import type {
  Action,
  AIStrategyConfig,
  MatchConfig,
  MatchStatus,
  MatchWinner,
  ProbabilityTriple,
  RoundRecord,
  RoundResult,
  Score,
} from '@/types/rps'
import { ACTIONS } from '@/types/rps'

/**
 * Frontend demo mirror of `backend/app/games/rock_paper_scissors/`.
 * Every rule here (payoff matrix, validation tolerance, win-threshold
 * formula, lock/resolve ordering) is a deliberate 1:1 port of the
 * Python engine — see docs/RPS_GAMEPLAY.md for the side-by-side
 * mapping. This file never computes anything the Python engine
 * wouldn't; it exists only because no backend API exists yet (Phase
 * 12) for the browser to call the real engine directly.
 */

export class RPSError extends Error {}
export class InvalidActionError extends RPSError {}
export class InvalidMixedStrategyError extends RPSError {
  reason: string

  constructor(reason: string, message: string) {
    super(message)
    this.reason = reason
  }
}
export class InvalidMatchConfigError extends RPSError {}
export class MatchAlreadyCompleteError extends RPSError {
  constructor() {
    super('This match is already complete; it cannot accept further moves.')
  }
}
export class MoveAlreadyLockedError extends RPSError {
  constructor() {
    super('A player move is already locked for this round; resolve it before locking another.')
  }
}
export class NoPendingMoveError extends RPSError {
  constructor() {
    super('No player move is locked for this round; call lockPlayerMove() first.')
  }
}

export const MIN_BEST_OF = 1
export const MAX_BEST_OF = 101

/** Same tolerance as the Python engine's `DEFAULT_TOLERANCE`. */
export const DEFAULT_TOLERANCE = 1e-9

export const DEFAULT_BIASED_DEMO_PROBABILITIES: ProbabilityTriple = { ROCK: 0.7, PAPER: 0.2, SCISSORS: 0.1 }

/** Player A's payoff — identical table to `payoff.py::PAYOFF_MATRIX`.
 * Exported so other frontend modules (e.g. `rpsGameTheory.ts`) reuse
 * this exact table rather than re-typing the same literal. */
export const PAYOFF_MATRIX: Record<Action, Record<Action, number>> = {
  ROCK: { ROCK: 0, PAPER: -1, SCISSORS: 1 },
  PAPER: { ROCK: 1, PAPER: 0, SCISSORS: -1 },
  SCISSORS: { ROCK: -1, PAPER: 1, SCISSORS: 0 },
}

export function validateProbabilities(probabilities: ProbabilityTriple): void {
  for (const action of ACTIONS) {
    const p = probabilities[action]
    if (!Number.isFinite(p)) {
      throw new InvalidMixedStrategyError('not_finite', `Probability for ${action} is not finite.`)
    }
    if (p < 0) {
      throw new InvalidMixedStrategyError('negative_probability', `Probability for ${action} is negative (${p}).`)
    }
  }
  const total = probabilities.ROCK + probabilities.PAPER + probabilities.SCISSORS
  if (Math.abs(total - 1) > DEFAULT_TOLERANCE) {
    throw new InvalidMixedStrategyError(
      'sum_mismatch',
      `Probabilities must sum to 1 within tolerance ${DEFAULT_TOLERANCE}; got sum=${total}.`,
    )
  }
}

/** Never silently normalizes — mirrors `MixedStrategy`'s own contract. */
export function validatedStrategy(probabilities: ProbabilityTriple): ProbabilityTriple {
  validateProbabilities(probabilities)
  return probabilities
}

export function resolveAiStrategy(config: AIStrategyConfig): ProbabilityTriple {
  switch (config.kind) {
    case 'NASH_UNIFORM':
    case 'RANDOM_UNIFORM':
      // Same distribution for both — see docs/RPS_GAMEPLAY.md: these
      // are never presented as mathematically different strategies.
      return { ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3 }
    case 'CUSTOM':
      if (!config.customProbabilities) {
        throw new InvalidMatchConfigError('AIStrategyKind.CUSTOM requires customProbabilities.')
      }
      return validatedStrategy(config.customProbabilities)
    case 'BIASED_DEMO':
      return config.biasedDemoProbabilities ?? DEFAULT_BIASED_DEMO_PROBABILITIES
    default:
      throw new InvalidMatchConfigError(`Unknown AIStrategyKind: ${config.kind}`)
  }
}

export function explainAiStrategy(config: AIStrategyConfig): string {
  switch (config.kind) {
    case 'NASH_UNIFORM':
      return "This strategy randomizes uniformly (1/3 Rock, 1/3 Paper, 1/3 Scissors) and cannot be exploited in expectation by an opponent using a fixed strategy. It does not guarantee that the AI wins individual rounds."
    case 'RANDOM_UNIFORM':
      return "This strategy picks uniformly at random (1/3 Rock, 1/3 Paper, 1/3 Scissors) — the exact same probability distribution as the Nash equilibrium strategy, just framed as plain randomness rather than game-theoretic optimality. The two options play identically."
    case 'CUSTOM': {
      const p = resolveAiStrategy(config)
      return `A custom distribution you configured: Rock ${(p.ROCK * 100).toFixed(0)}%, Paper ${(p.PAPER * 100).toFixed(0)}%, Scissors ${(p.SCISSORS * 100).toFixed(0)}%. Unless this equals (1/3, 1/3, 1/3), it is exploitable by a suitable best response.`
    }
    case 'BIASED_DEMO': {
      const p = resolveAiStrategy(config)
      return `A deliberately predictable demonstration strategy (Rock ${(p.ROCK * 100).toFixed(0)}%, Paper ${(p.PAPER * 100).toFixed(0)}%, Scissors ${(p.SCISSORS * 100).toFixed(0)}%) — not an optimal strategy. It exists to show how a biased opponent can be exploited.`
    }
    default:
      return ''
  }
}

/** Resolves a round from the player's perspective — identical rule to `payoff.py::resolve_round`. */
export function resolveRound(playerAction: Action, aiAction: Action): RoundResult {
  const value = PAYOFF_MATRIX[playerAction][aiAction]
  if (value > 0) return 'PLAYER_WIN'
  if (value < 0) return 'AI_WIN'
  return 'TIE'
}

/** A pluggable random source — `Math.random` in production, a seeded
 * generator in tests, exactly mirroring the Python engine's injected
 * `random.Random`. Never a module-level/global mutable source. */
export type RandomSource = () => number

export function sampleAction(probabilities: ProbabilityTriple, rng: RandomSource): Action {
  const roll = rng()
  let cumulative = 0
  for (const action of ACTIONS) {
    cumulative += probabilities[action]
    if (roll < cumulative) return action
  }
  return ACTIONS[ACTIONS.length - 1]
}

/** A tiny, deterministic PRNG (mulberry32) for reproducible frontend
 * tests — not used in production play, where `Math.random` is used
 * directly. Mirrors the backend's test-vs-production seed distinction
 * (see `session.py`). */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function validateMatchConfig(config: MatchConfig): void {
  if (!Number.isInteger(config.bestOf)) {
    throw new InvalidMatchConfigError(`bestOf must be an integer; got ${config.bestOf}.`)
  }
  if (config.bestOf < MIN_BEST_OF || config.bestOf > MAX_BEST_OF) {
    throw new InvalidMatchConfigError(`bestOf must be between ${MIN_BEST_OF} and ${MAX_BEST_OF}; got ${config.bestOf}.`)
  }
  if (config.bestOf % 2 === 0) {
    throw new InvalidMatchConfigError(
      `bestOf must be odd (e.g. 3, 5, 7) so the match has a decisive winner threshold; got ${config.bestOf}.`,
    )
  }
}

export function winThreshold(bestOf: number): number {
  return Math.floor(bestOf / 2) + 1
}

function emptyScore(): Score {
  return { playerWins: 0, aiWins: 0, ties: 0 }
}

/**
 * A single stateful match — a direct port of `match.py::RPSMatch`.
 *
 * **Simultaneous-action fairness is enforced the same way as the
 * backend:** `resolvePendingRound()` is the only place the AI's
 * action is ever sampled, and it can only run after
 * `lockPlayerMove()` has already stored the player's choice. There
 * is no method that returns or previews an AI action before that.
 */
export class RPSMatchEngine {
  private _config: MatchConfig
  private readonly rng: RandomSource
  private _history: RoundRecord[] = []
  private _score: Score = emptyScore()
  private _pendingPlayerAction: Action | null = null

  constructor(config: MatchConfig, rng: RandomSource = Math.random) {
    validateMatchConfig(config)
    this._config = config
    this.rng = rng
  }

  get config(): MatchConfig {
    return this._config
  }

  get score(): Score {
    return this._score
  }

  get history(): readonly RoundRecord[] {
    return [...this._history]
  }

  get hasPendingMove(): boolean {
    return this._pendingPlayerAction !== null
  }

  get isComplete(): boolean {
    const threshold = winThreshold(this._config.bestOf)
    return this._score.playerWins >= threshold || this._score.aiWins >= threshold
  }

  get status(): MatchStatus {
    return this.isComplete ? 'COMPLETE' : 'AWAITING_PLAYER_MOVE'
  }

  get winner(): MatchWinner | null {
    if (!this.isComplete) return null
    return this._score.playerWins > this._score.aiWins ? 'PLAYER' : 'AI'
  }

  lockPlayerMove(action: Action): void {
    if (this.isComplete) throw new MatchAlreadyCompleteError()
    if (!ACTIONS.includes(action)) throw new InvalidActionError(`${action} is not a valid action.`)
    if (this._pendingPlayerAction !== null) throw new MoveAlreadyLockedError()
    this._pendingPlayerAction = action
  }

  resolvePendingRound(): RoundRecord {
    if (this.isComplete) throw new MatchAlreadyCompleteError()
    if (this._pendingPlayerAction === null) throw new NoPendingMoveError()

    const playerAction = this._pendingPlayerAction
    const aiProbabilities = resolveAiStrategy(this._config.aiStrategy)
    const aiAction = sampleAction(aiProbabilities, this.rng)
    const result = resolveRound(playerAction, aiAction)

    const scoreAfter: Score = {
      playerWins: this._score.playerWins + (result === 'PLAYER_WIN' ? 1 : 0),
      aiWins: this._score.aiWins + (result === 'AI_WIN' ? 1 : 0),
      ties: this._score.ties + (result === 'TIE' ? 1 : 0),
    }
    const record: RoundRecord = {
      roundNumber: this._history.length + 1,
      playerAction,
      aiAction,
      result,
      scoreAfter,
    }

    this._history.push(record)
    this._score = scoreAfter
    this._pendingPlayerAction = null
    return record
  }

  startNewMatch(config?: MatchConfig): void {
    if (config) {
      validateMatchConfig(config)
      this._config = config
    }
    this._history = []
    this._score = emptyScore()
    this._pendingPlayerAction = null
  }
}

/** A human-readable explanation of why a resolved round went the way it did. */
export function explainRoundResult(record: RoundRecord): string {
  if (record.result === 'TIE') {
    return `Both played ${record.playerAction} — a tie.`
  }
  const winningAction = record.result === 'PLAYER_WIN' ? record.playerAction : record.aiAction
  const losingAction = record.result === 'PLAYER_WIN' ? record.aiAction : record.playerAction
  const who = record.result === 'PLAYER_WIN' ? 'You win' : 'AI wins'
  return `${winningAction} beats ${losingAction} — ${who} this round.`
}
