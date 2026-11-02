import { describe, expect, it } from 'vitest'
import {
  bestResponse,
  bestResponseValue,
  deriveUniformEquilibrium,
  EQUILIBRIUM_GAME_VALUE,
  expectedPayoff,
  expectedPayoffA,
  expectedPayoffB,
  expectedPayoffContributions,
  exploitability,
  isTiedBestResponse,
  normalizeWeights,
  pureStrategy,
  uniformStrategy,
  verifyEquilibrium,
} from './rpsGameTheory'
import { InvalidMixedStrategyError } from './rpsEngine'
import type { ProbabilityTriple } from '@/types/rps'

const ROCK = pureStrategy('ROCK')
const PAPER = pureStrategy('PAPER')
const SCISSORS = pureStrategy('SCISSORS')
const UNIFORM = uniformStrategy()

describe('expectedPayoffA / expectedPayoffB', () => {
  it.each([
    ['ROCK', 'ROCK', 0],
    ['ROCK', 'PAPER', -1],
    ['ROCK', 'SCISSORS', 1],
    ['PAPER', 'ROCK', 1],
    ['PAPER', 'PAPER', 0],
    ['PAPER', 'SCISSORS', -1],
    ['SCISSORS', 'ROCK', -1],
    ['SCISSORS', 'PAPER', 1],
    ['SCISSORS', 'SCISSORS', 0],
  ] as const)('pure %s vs pure %s -> %d', (a, b, expected) => {
    expect(expectedPayoffA(pureStrategy(a), pureStrategy(b))).toBe(expected)
  })

  it('is zero-sum for every pairing (mixed vs mixed included)', () => {
    const p: ProbabilityTriple = { ROCK: 0.2, PAPER: 0.3, SCISSORS: 0.5 }
    const q: ProbabilityTriple = { ROCK: 0.5, PAPER: 0.1, SCISSORS: 0.4 }
    expect(expectedPayoffB(p, q)).toBeCloseTo(-expectedPayoffA(p, q))
  })

  it('matches the hand-calculated example from docs/RPS_STRATEGY_ENGINE.md §3', () => {
    // A plays (0.5, 0.5, 0.0), B plays (0.0, 0.5, 0.5) -> -0.25 for A, +0.25 for B.
    const a: ProbabilityTriple = { ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.0 }
    const b: ProbabilityTriple = { ROCK: 0.0, PAPER: 0.5, SCISSORS: 0.5 }
    expect(expectedPayoffA(a, b)).toBeCloseTo(-0.25)
    expect(expectedPayoffB(a, b)).toBeCloseTo(0.25)
  })

  it('uniform vs uniform is exactly 0 (the equilibrium game value)', () => {
    expect(expectedPayoffA(UNIFORM, UNIFORM)).toBeCloseTo(0)
  })

  it('dispatches via expectedPayoff(player, ...)', () => {
    expect(expectedPayoff('A', ROCK, SCISSORS)).toBe(1)
    expect(expectedPayoff('B', ROCK, SCISSORS)).toBe(-1)
  })
})

describe('expectedPayoffContributions', () => {
  it('sums back to expectedPayoffA exactly', () => {
    const a: ProbabilityTriple = { ROCK: 0.2, PAPER: 0.3, SCISSORS: 0.5 }
    const b: ProbabilityTriple = { ROCK: 0.5, PAPER: 0.1, SCISSORS: 0.4 }
    const contributions = expectedPayoffContributions(a, b)
    expect(contributions).toHaveLength(9)
    const total = contributions.reduce((sum, c) => sum + c.contributionA, 0)
    expect(total).toBeCloseTo(expectedPayoffA(a, b))
  })

  it('each contribution is probability times the raw payoff', () => {
    const contributions = expectedPayoffContributions(ROCK, SCISSORS)
    const rockVsScissors = contributions.find((c) => c.actionA === 'ROCK' && c.actionB === 'SCISSORS')
    expect(rockVsScissors).toMatchObject({ probability: 1, payoffA: 1, contributionA: 1 })
  })
})

describe('bestResponse', () => {
  it('best responds to pure Rock with Paper only', () => {
    const result = bestResponse('A', ROCK)
    expect(result.bestActions).toEqual(['PAPER'])
    expect(isTiedBestResponse(result)).toBe(false)
  })

  it('best responds to pure Paper with Scissors only', () => {
    expect(bestResponse('A', PAPER).bestActions).toEqual(['SCISSORS'])
  })

  it('best responds to pure Scissors with Rock only', () => {
    expect(bestResponse('A', SCISSORS).bestActions).toEqual(['ROCK'])
  })

  it('ties across all three actions against the uniform strategy', () => {
    const result = bestResponse('A', UNIFORM)
    expect(result.bestActions).toEqual(['ROCK', 'PAPER', 'SCISSORS'])
    expect(isTiedBestResponse(result)).toBe(true)
    expect(bestResponseValue(result)).toBeCloseTo(0)
  })

  it("computes Player B's best response via expectedPayoffB, not a re-derived sign", () => {
    // B facing A=pure ROCK: B's best response is PAPER (same logical answer,
    // computed from B's own payoff perspective).
    const result = bestResponse('B', ROCK)
    expect(result.bestActions).toEqual(['PAPER'])
  })

  it('best response to a biased strategy is a single clear winner, not a tie', () => {
    const biased: ProbabilityTriple = { ROCK: 0.7, PAPER: 0.2, SCISSORS: 0.1 }
    const result = bestResponse('A', biased)
    expect(result.bestActions).toEqual(['PAPER'])
    expect(isTiedBestResponse(result)).toBe(false)
  })
})

describe('verifyEquilibrium', () => {
  it('confirms (uniform, uniform) is a Nash equilibrium', () => {
    const verification = verifyEquilibrium(UNIFORM, UNIFORM)
    expect(verification.isEquilibrium).toBe(true)
    expect(verification.valueA).toBeCloseTo(0)
    expect(verification.valueB).toBeCloseTo(0)
  })

  it('rejects "always Rock" played by both sides as an equilibrium candidate', () => {
    const verification = verifyEquilibrium(ROCK, ROCK)
    expect(verification.isEquilibrium).toBe(false)
  })

  it('rejects the asymmetric case where only Player A deviates to pure Rock', () => {
    // A's pure Rock happens to tie for best response against a uniform B
    // (every pure action ties at 0 against uniform), but B's uniform play is
    // not itself a best response to A's pure Rock (B's best response there
    // is Paper only) — so the pair still fails as a whole.
    const verification = verifyEquilibrium(ROCK, UNIFORM)
    expect(verification.isEquilibrium).toBe(false)
    expect(verification.bPlaysOnlyBestResponses).toBe(false)
  })

  it('every pure action has expected payoff 0 against a uniform opponent (no unilateral improvement)', () => {
    const verification = verifyEquilibrium(UNIFORM, UNIFORM)
    for (const action of ['ROCK', 'PAPER', 'SCISSORS'] as const) {
      expect(verification.bestResponseA.payoffs[action]).toBeCloseTo(0)
    }
  })

  it("deriveUniformEquilibrium matches uniformStrategy and Phase 8's documented equilibrium", () => {
    expect(deriveUniformEquilibrium()).toEqual(uniformStrategy())
    expect(deriveUniformEquilibrium()).toEqual({ ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3 })
  })
})

describe('exploitability', () => {
  it('the uniform strategy has zero exploitability', () => {
    const result = exploitability(UNIFORM, 'A')
    expect(result.exploitability).toBeCloseTo(0)
  })

  it('always playing Rock is exploitable for exactly 1 (Paper beats it every time)', () => {
    const result = exploitability(ROCK, 'A')
    expect(result.exploitability).toBeCloseTo(1)
    expect(result.opponentBestResponse.bestActions).toEqual(['PAPER'])
  })

  it('a biased strategy is exploitable (positive, computed, never hardcoded)', () => {
    const biased: ProbabilityTriple = { ROCK: 0.6, PAPER: 0.2, SCISSORS: 0.2 }
    const result = exploitability(biased, 'A')
    expect(result.exploitability).toBeGreaterThan(0)
  })

  it('exploitability is never negative, by construction', () => {
    const strategies: ProbabilityTriple[] = [
      UNIFORM,
      ROCK,
      PAPER,
      SCISSORS,
      { ROCK: 0.1, PAPER: 0.1, SCISSORS: 0.8 },
      { ROCK: 0.4, PAPER: 0.4, SCISSORS: 0.2 },
    ]
    for (const strategy of strategies) {
      expect(exploitability(strategy, 'A').exploitability).toBeGreaterThanOrEqual(-1e-9)
    }
  })

  it('matches EQUILIBRIUM_GAME_VALUE as its baseline', () => {
    expect(EQUILIBRIUM_GAME_VALUE).toBe(0)
  })
})

describe('Python/TypeScript parity (values cross-checked against the live backend engine)', () => {
  // Reproduced by running the actual Python engine, not hand-derived
  // separately — see docs/RPS_STRATEGY_VISUALIZATION.md "Python/TypeScript
  // Parity Verification" for the exact commands used to generate these.
  it('expected_payoff_a(0.2/0.3/0.5, 0.5/0.1/0.4) matches the Python engine', () => {
    const a: ProbabilityTriple = { ROCK: 0.2, PAPER: 0.3, SCISSORS: 0.5 }
    const b: ProbabilityTriple = { ROCK: 0.5, PAPER: 0.1, SCISSORS: 0.4 }
    expect(expectedPayoffA(a, b)).toBeCloseTo(-0.10999999999999999, 12)
    expect(expectedPayoffB(a, b)).toBeCloseTo(0.10999999999999999, 12)
  })

  it('exploitability(0.6/0.2/0.2, A) matches the Python engine', () => {
    const biased: ProbabilityTriple = { ROCK: 0.6, PAPER: 0.2, SCISSORS: 0.2 }
    expect(exploitability(biased, 'A').exploitability).toBeCloseTo(0.39999999999999997, 12)
    expect(bestResponse('A', biased).bestActions).toEqual(['PAPER'])
  })

  it('verifyEquilibrium(pure Rock, uniform) matches the Python engine exactly, including the split verdict', () => {
    const v = verifyEquilibrium(ROCK, UNIFORM)
    expect(v.isEquilibrium).toBe(false)
    expect(v.aPlaysOnlyBestResponses).toBe(true)
    expect(v.bPlaysOnlyBestResponses).toBe(false)
  })
})

describe('normalizeWeights', () => {
  it('is the only path that rescales invalid-sum input into a valid strategy', () => {
    const normalized = normalizeWeights({ ROCK: 2, PAPER: 1, SCISSORS: 1 })
    expect(normalized.ROCK).toBeCloseTo(0.5)
    expect(normalized.PAPER).toBeCloseTo(0.25)
    expect(normalized.SCISSORS).toBeCloseTo(0.25)
  })

  it('rejects negative weights rather than silently clamping them', () => {
    expect(() => normalizeWeights({ ROCK: -1, PAPER: 1, SCISSORS: 1 })).toThrow(InvalidMixedStrategyError)
  })

  it('rejects a zero total', () => {
    expect(() => normalizeWeights({ ROCK: 0, PAPER: 0, SCISSORS: 0 })).toThrow(InvalidMixedStrategyError)
  })

  it('rejects non-finite weights', () => {
    expect(() => normalizeWeights({ ROCK: Number.NaN, PAPER: 1, SCISSORS: 1 })).toThrow(InvalidMixedStrategyError)
  })
})
