import type { Action, ProbabilityTriple } from '@/types/rps'
import { ACTIONS } from '@/types/rps'
import { DEFAULT_TOLERANCE, InvalidMixedStrategyError, PAYOFF_MATRIX } from './rpsEngine'

/**
 * Frontend demo mirror of `backend/app/games/rock_paper_scissors/
 * {analysis.py, equilibrium.py}` — same payoff matrix (imported from
 * `rpsEngine.ts`, itself a verified mirror of `payoff.py`), same
 * bilinear expected-payoff formula, same best-response/exploitability
 * definitions, same tolerance. See docs/RPS_STRATEGY_VISUALIZATION.md
 * for the Python/TypeScript parity checks. This module never computes
 * anything the Python engine wouldn't; it exists only because no
 * backend API exists yet (Phase 12) for the browser to call the real
 * engine directly.
 */

export type Player = 'A' | 'B'

export function opponentOf(player: Player): Player {
  return player === 'A' ? 'B' : 'A'
}

/** The (1/3, 1/3, 1/3) strategy — see `equilibrium.py::derive_uniform_equilibrium`. */
export function uniformStrategy(): ProbabilityTriple {
  return { ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3 }
}

/** A degenerate mixed strategy that always plays `action` — mirrors `MixedStrategy.pure`. */
export function pureStrategy(action: Action): ProbabilityTriple {
  return {
    ROCK: action === 'ROCK' ? 1 : 0,
    PAPER: action === 'PAPER' ? 1 : 0,
    SCISSORS: action === 'SCISSORS' ? 1 : 0,
  }
}

/** Derives (rather than assumes) the equilibrium — see `equilibrium.py`'s
 * symmetry argument, reproduced in docs/RPS_STRATEGY_ENGINE.md §5. This
 * function and `uniformStrategy()` return the same value on purpose:
 * the derivation is the *justification*, not a different number. */
export function deriveUniformEquilibrium(): ProbabilityTriple {
  return uniformStrategy()
}

/** Explicitly, opt-in-only normalization — mirrors
 * `MixedStrategy.from_unnormalized`. Never called implicitly by any
 * validation path in this module; a caller must ask for it by name. */
export function normalizeWeights(weights: ProbabilityTriple): ProbabilityTriple {
  for (const action of ACTIONS) {
    const w = weights[action]
    if (!Number.isFinite(w) || w < 0) {
      throw new InvalidMixedStrategyError(
        'invalid_weight',
        `Weight for ${action} must be a finite, non-negative number; got ${w}.`,
      )
    }
  }
  const total = weights.ROCK + weights.PAPER + weights.SCISSORS
  if (total <= 0) {
    throw new InvalidMixedStrategyError('zero_total_weight', 'Weights must sum to a positive number.')
  }
  return {
    ROCK: weights.ROCK / total,
    PAPER: weights.PAPER / total,
    SCISSORS: weights.SCISSORS / total,
  }
}

/** Player A's expected payoff: the bilinear form `p^T A q` — mirrors
 * `analysis.py::expected_payoff_a` term for term. */
export function expectedPayoffA(strategyA: ProbabilityTriple, strategyB: ProbabilityTriple): number {
  let total = 0
  for (const a of ACTIONS) {
    for (const b of ACTIONS) {
      total += strategyA[a] * PAYOFF_MATRIX[a][b] * strategyB[b]
    }
  }
  return total
}

/** Player B's expected payoff for the same pair — always the negation
 * of `expectedPayoffA`, enforced structurally (zero-sum). */
export function expectedPayoffB(strategyA: ProbabilityTriple, strategyB: ProbabilityTriple): number {
  return -expectedPayoffA(strategyA, strategyB)
}

export function expectedPayoff(player: Player, strategyA: ProbabilityTriple, strategyB: ProbabilityTriple): number {
  return player === 'A' ? expectedPayoffA(strategyA, strategyB) : expectedPayoffB(strategyA, strategyB)
}

export interface PayoffContribution {
  actionA: Action
  actionB: Action
  /** probA(actionA) * probB(actionB) — the joint probability of this pairing occurring. */
  probability: number
  /** PAYOFF_MATRIX[actionA][actionB] — Player A's raw payoff for this pairing. */
  payoffA: number
  /** probability * payoffA — this pairing's contribution to `expectedPayoffA`. */
  contributionA: number
}

/** Breaks `expectedPayoffA` into its 9 additive terms, one per action
 * pairing. Summing every `contributionA` reproduces `expectedPayoffA`
 * exactly — used to show "where the expected payoff comes from"
 * rather than only the final number. */
export function expectedPayoffContributions(
  strategyA: ProbabilityTriple,
  strategyB: ProbabilityTriple,
): PayoffContribution[] {
  const result: PayoffContribution[] = []
  for (const a of ACTIONS) {
    for (const b of ACTIONS) {
      const probability = strategyA[a] * strategyB[b]
      const payoffA = PAYOFF_MATRIX[a][b]
      result.push({ actionA: a, actionB: b, probability, payoffA, contributionA: probability * payoffA })
    }
  }
  return result
}

export interface BestResponseResult {
  player: Player
  /** Every pure action's expected payoff — including the non-optimal
   * ones, so a caller can see how much worse an action would have
   * been, not just which action(s) win. */
  payoffs: Record<Action, number>
  /** Every action within `tolerance` of the maximum — a genuine tie
   * is never broken arbitrarily. */
  bestActions: Action[]
}

export function bestResponseValue(result: BestResponseResult): number {
  return Math.max(...ACTIONS.map((a) => result.payoffs[a]))
}

export function isTiedBestResponse(result: BestResponseResult): boolean {
  return result.bestActions.length > 1
}

/** `player`'s best response(s) to a fixed `opponentStrategy` — mirrors
 * `analysis.py::best_response` exactly, including tie preservation. */
export function bestResponse(
  player: Player,
  opponentStrategy: ProbabilityTriple,
  tolerance: number = DEFAULT_TOLERANCE,
): BestResponseResult {
  const payoffs: Record<Action, number> = { ROCK: 0, PAPER: 0, SCISSORS: 0 }
  for (const action of ACTIONS) {
    const pure = pureStrategy(action)
    payoffs[action] =
      player === 'A' ? expectedPayoffA(pure, opponentStrategy) : expectedPayoffB(opponentStrategy, pure)
  }
  const max = Math.max(...ACTIONS.map((a) => payoffs[a]))
  const bestActions = ACTIONS.filter((a) => Math.abs(payoffs[a] - max) <= tolerance)
  return { player, payoffs, bestActions }
}

export interface EquilibriumVerification {
  isEquilibrium: boolean
  valueA: number
  valueB: number
  bestResponseA: BestResponseResult
  bestResponseB: BestResponseResult
  aPlaysOnlyBestResponses: boolean
  bPlaysOnlyBestResponses: boolean
}

function support(strategy: ProbabilityTriple): Action[] {
  return ACTIONS.filter((a) => strategy[a] > 0)
}

/** Checks whether `(strategyA, strategyB)` is a Nash equilibrium —
 * recomputes each player's best response from scratch rather than
 * assuming either strategy is correct; mirrors
 * `equilibrium.py::verify_equilibrium`. */
export function verifyEquilibrium(
  strategyA: ProbabilityTriple,
  strategyB: ProbabilityTriple,
  tolerance: number = DEFAULT_TOLERANCE,
): EquilibriumVerification {
  const bestResponseA = bestResponse('A', strategyB, tolerance)
  const bestResponseB = bestResponse('B', strategyA, tolerance)
  const maxA = bestResponseValue(bestResponseA)
  const maxB = bestResponseValue(bestResponseB)
  const aOptimal = support(strategyA).every((a) => Math.abs(bestResponseA.payoffs[a] - maxA) <= tolerance)
  const bOptimal = support(strategyB).every((a) => Math.abs(bestResponseB.payoffs[a] - maxB) <= tolerance)
  const valueA = expectedPayoffA(strategyA, strategyB)
  return {
    isEquilibrium: aOptimal && bOptimal,
    valueA,
    valueB: -valueA,
    bestResponseA,
    bestResponseB,
    aPlaysOnlyBestResponses: aOptimal,
    bPlaysOnlyBestResponses: bOptimal,
  }
}

/** The game's value at equilibrium (zero-sum and symmetric, so 0 for
 * either player) — exploitability is measured relative to this, never
 * an arbitrary or implicit baseline. Mirrors `analysis.py::EQUILIBRIUM_GAME_VALUE`. */
export const EQUILIBRIUM_GAME_VALUE = 0

export interface ExploitabilityResult {
  exploitedPlayer: Player
  /** Always non-negative: the opponent can always guarantee at least
   * 0 by playing uniform themselves, so best-responding can never do
   * worse than 0. 0 (within tolerance) means not exploitable; a
   * positive value is the opponent's per-round expected profit. */
  exploitability: number
  opponentBestResponse: BestResponseResult
}

/** How exploitable `strategy` is, if played by `player` — mirrors
 * `analysis.py::exploitability`'s sign convention exactly: the best
 * expected payoff the opponent can guarantee by best-responding,
 * minus `EQUILIBRIUM_GAME_VALUE`. Never redefined or re-signed here. */
export function exploitability(
  strategy: ProbabilityTriple,
  player: Player = 'A',
  tolerance: number = DEFAULT_TOLERANCE,
): ExploitabilityResult {
  const opponent = opponentOf(player)
  const response = bestResponse(opponent, strategy, tolerance)
  return {
    exploitedPlayer: player,
    exploitability: bestResponseValue(response) - EQUILIBRIUM_GAME_VALUE,
    opponentBestResponse: response,
  }
}
