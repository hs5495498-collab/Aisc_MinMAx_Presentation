import { describe, expect, it } from 'vitest'
import {
  createSeededRandom,
  InvalidActionError,
  InvalidMatchConfigError,
  InvalidMixedStrategyError,
  MatchAlreadyCompleteError,
  MoveAlreadyLockedError,
  NoPendingMoveError,
  resolveAiStrategy,
  resolveRound,
  RPSMatchEngine,
  sampleAction,
  validateMatchConfig,
  winThreshold,
} from './rpsEngine'
import type { Action, MatchConfig } from '@/types/rps'

const NASH: MatchConfig = { bestOf: 3, aiStrategy: { kind: 'NASH_UNIFORM' } }

function pureAiConfig(action: Action, bestOf = 7): MatchConfig {
  const probs = { ROCK: 0, PAPER: 0, SCISSORS: 0 }
  probs[action] = 1
  return { bestOf, aiStrategy: { kind: 'CUSTOM', customProbabilities: probs } }
}

describe('resolveRound', () => {
  it.each([
    ['ROCK', 'ROCK', 'TIE'],
    ['ROCK', 'PAPER', 'AI_WIN'],
    ['ROCK', 'SCISSORS', 'PLAYER_WIN'],
    ['PAPER', 'ROCK', 'PLAYER_WIN'],
    ['PAPER', 'PAPER', 'TIE'],
    ['PAPER', 'SCISSORS', 'AI_WIN'],
    ['SCISSORS', 'ROCK', 'AI_WIN'],
    ['SCISSORS', 'PAPER', 'PLAYER_WIN'],
    ['SCISSORS', 'SCISSORS', 'TIE'],
  ] as const)('%s vs %s -> %s', (player, ai, expected) => {
    expect(resolveRound(player, ai)).toBe(expected)
  })
})

describe('resolveAiStrategy', () => {
  it('NASH_UNIFORM and RANDOM_UNIFORM resolve to the same distribution', () => {
    const nash = resolveAiStrategy({ kind: 'NASH_UNIFORM' })
    const rand = resolveAiStrategy({ kind: 'RANDOM_UNIFORM' })
    expect(rand).toEqual(nash)
    expect(nash.ROCK).toBeCloseTo(1 / 3)
  })

  it('CUSTOM requires valid probabilities', () => {
    expect(() => resolveAiStrategy({ kind: 'CUSTOM' })).toThrow(InvalidMatchConfigError)
    expect(() =>
      resolveAiStrategy({ kind: 'CUSTOM', customProbabilities: { ROCK: 0.5, PAPER: 0.5, SCISSORS: 0.5 } }),
    ).toThrow(InvalidMixedStrategyError)
  })

  it('CUSTOM is never silently normalized', () => {
    expect(() =>
      resolveAiStrategy({ kind: 'CUSTOM', customProbabilities: { ROCK: 0.6, PAPER: 0.6, SCISSORS: 0.2 } }),
    ).toThrow(InvalidMixedStrategyError)
  })

  it('BIASED_DEMO defaults to 70/20/10', () => {
    expect(resolveAiStrategy({ kind: 'BIASED_DEMO' })).toEqual({ ROCK: 0.7, PAPER: 0.2, SCISSORS: 0.1 })
  })
})

describe('validateMatchConfig', () => {
  it('accepts odd bestOf values', () => {
    for (const bestOf of [1, 3, 5, 7, 9, 101]) {
      expect(() => validateMatchConfig({ bestOf, aiStrategy: { kind: 'NASH_UNIFORM' } })).not.toThrow()
    }
  })

  it('rejects even bestOf', () => {
    expect(() => validateMatchConfig({ bestOf: 4, aiStrategy: { kind: 'NASH_UNIFORM' } })).toThrow(
      InvalidMatchConfigError,
    )
  })

  it('rejects bestOf above the documented maximum', () => {
    expect(() => validateMatchConfig({ bestOf: 103, aiStrategy: { kind: 'NASH_UNIFORM' } })).toThrow(
      InvalidMatchConfigError,
    )
  })

  it('winThreshold matches best-of-3/5/7', () => {
    expect(winThreshold(3)).toBe(2)
    expect(winThreshold(5)).toBe(3)
    expect(winThreshold(7)).toBe(4)
  })
})

describe('sampleAction with createSeededRandom', () => {
  it('is deterministic for a given seed', () => {
    const probs = { ROCK: 1 / 3, PAPER: 1 / 3, SCISSORS: 1 / 3 }
    const rng1 = createSeededRandom(42)
    const seq1 = Array.from({ length: 20 }, () => sampleAction(probs, rng1))
    // A second, independently-created generator with the same seed must
    // reproduce the exact same sequence of draws.
    const rng2 = createSeededRandom(42)
    const seq2 = Array.from({ length: 20 }, () => sampleAction(probs, rng2))
    expect(seq2).toEqual(seq1)
  })

  it('always returns a valid action', () => {
    const probs = { ROCK: 0.2, PAPER: 0.3, SCISSORS: 0.5 }
    const rng = createSeededRandom(7)
    for (let i = 0; i < 50; i++) {
      expect(['ROCK', 'PAPER', 'SCISSORS']).toContain(sampleAction(probs, rng))
    }
  })
})

describe('RPSMatchEngine', () => {
  it('rejects invalid match config at construction', () => {
    expect(() => new RPSMatchEngine({ bestOf: 4, aiStrategy: { kind: 'NASH_UNIFORM' } })).toThrow(
      InvalidMatchConfigError,
    )
  })

  it('starts AWAITING_PLAYER_MOVE with zero score', () => {
    const match = new RPSMatchEngine(NASH, createSeededRandom(1))
    expect(match.status).toBe('AWAITING_PLAYER_MOVE')
    expect(match.score).toEqual({ playerWins: 0, aiWins: 0, ties: 0 })
    expect(match.hasPendingMove).toBe(false)
  })

  it('does not reveal an AI action before resolution', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS'), createSeededRandom(1))
    match.lockPlayerMove('ROCK')
    expect(match.hasPendingMove).toBe(true)
    expect((match as unknown as { aiAction?: Action }).aiAction).toBeUndefined()
    const record = match.resolvePendingRound()
    expect(record.aiAction).toBe('SCISSORS')
  })

  it('rejects double submission', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS'), createSeededRandom(1))
    match.lockPlayerMove('ROCK')
    expect(() => match.lockPlayerMove('PAPER')).toThrow(MoveAlreadyLockedError)
  })

  it('rejects double resolution', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS'), createSeededRandom(1))
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    expect(() => match.resolvePendingRound()).toThrow(NoPendingMoveError)
  })

  it('rejects resolving with nothing locked', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS'), createSeededRandom(1))
    expect(() => match.resolvePendingRound()).toThrow(NoPendingMoveError)
  })

  it('rejects an invalid action', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS'), createSeededRandom(1))
    expect(() => match.lockPlayerMove('LIZARD' as Action)).toThrow(InvalidActionError)
  })

  it('completes a best-of-3 match at the correct threshold and rejects further moves', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS', 3), createSeededRandom(1)) // player always wins with ROCK
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    expect(match.isComplete).toBe(false)
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    expect(match.isComplete).toBe(true)
    expect(match.winner).toBe('PLAYER')
    expect(() => match.lockPlayerMove('ROCK')).toThrow(MatchAlreadyCompleteError)
  })

  it('draws never count toward the win threshold', () => {
    const match = new RPSMatchEngine(pureAiConfig('ROCK', 3), createSeededRandom(1)) // player ROCK vs AI ROCK -> tie every time
    for (let i = 0; i < 5; i++) {
      match.lockPlayerMove('ROCK')
      match.resolvePendingRound()
    }
    expect(match.score.ties).toBe(5)
    expect(match.isComplete).toBe(false)
  })

  it('records history with running score snapshots', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS', 7), createSeededRandom(1))
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    expect(match.history.map((r) => r.scoreAfter.playerWins)).toEqual([1, 2])
    expect(match.history.map((r) => r.roundNumber)).toEqual([1, 2])
  })

  it('startNewMatch clears score, history, and pending move', () => {
    const match = new RPSMatchEngine(pureAiConfig('SCISSORS', 3), createSeededRandom(1))
    match.lockPlayerMove('ROCK')
    match.resolvePendingRound()
    match.startNewMatch()
    expect(match.score).toEqual({ playerWins: 0, aiWins: 0, ties: 0 })
    expect(match.history).toEqual([])
    expect(match.hasPendingMove).toBe(false)
  })

  it('reproducible: same seed and same moves produce the same AI actions', () => {
    const config: MatchConfig = { bestOf: 9, aiStrategy: { kind: 'NASH_UNIFORM' } }
    const matchA = new RPSMatchEngine(config, createSeededRandom(999))
    const matchB = new RPSMatchEngine(config, createSeededRandom(999))
    const actionsA: Action[] = []
    const actionsB: Action[] = []
    for (let i = 0; i < 4; i++) {
      matchA.lockPlayerMove('ROCK')
      actionsA.push(matchA.resolvePendingRound().aiAction)
      matchB.lockPlayerMove('ROCK')
      actionsB.push(matchB.resolvePendingRound().aiAction)
    }
    expect(actionsA).toEqual(actionsB)
  })
})
