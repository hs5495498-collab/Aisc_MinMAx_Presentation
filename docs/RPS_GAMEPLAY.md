# Rock Paper Scissors Gameplay (Phase 9)

Backend: `backend/app/games/rock_paper_scissors/{ai_strategies.py,
match.py, session.py}` (built on top of the Phase 8 math engine —
`docs/RPS_STRATEGY_ENGINE.md`). Frontend:
`frontend/src/{types/rps.ts, lib/rpsEngine.ts, hooks/useRpsMatch.ts,
components/rps/gameplay/, features/games/rock-paper-scissors/}`.

This phase builds a complete human-vs-AI match experience — AI
strategy selection, best-of-N match configuration, round-by-round
play, scoreboard, history, and a final result screen. It reuses the
Phase 8 payoff engine unchanged; it does not re-derive or duplicate
any payoff/equilibrium math.

## 0. Scope Boundary

**Human vs. human play, the payoff-matrix view, and the
mixed-strategy/probability visualization are explicitly out of scope
here** — they belong to Phase 10 (strategy visualization) and remain
unbuilt. This corrects `PROJECT_PLAN.md`'s earlier Phase 1A framing of
Phase 9, which bundled "human vs. human" into this phase before the
actual Phase 9 brief was specified; the brief received for this phase
is human-vs-AI only.

Also explicitly not built here, per the brief: the RPS strategy matrix
visualization, a payoff matrix dashboard, strategy probability charts,
the algorithm-comparison dashboard, the sequential-reveal Alpha-Beta
educational variant (Phase 11), any FastAPI endpoint, database
persistence, authentication, or cloud deployment.

## 1. Why Simultaneous-Action Fairness Needs a Structural Fix, Not a Convention

Standard Rock Paper Scissors is a simultaneous-action game (see
`docs/RPS_STRATEGY_ENGINE.md` §1): both sides commit before either
sees the other's choice. A naive implementation that computes the
player's and AI's actions "whenever convenient" can leak the AI's
action into frontend state, a network response, or even just variable
scope before the player has committed — turning the game into a
sequential one by accident, and making the AI's equilibrium strategy
meaningless (an opponent who can see your move never needs game theory
at all; they just play the counter).

This phase enforces fairness **structurally**, with a two-method API
that makes the leak impossible rather than merely discouraged:

```python
match.lock_player_move(Action.ROCK)   # (1) player commits
record = match.resolve_pending_round() # (2) AI is sampled HERE, then resolved
```

`RPSMatch.resolve_pending_round()` (`match.py`) is the **only** place
in the entire codebase that calls `AIStrategyConfig.resolve()` /
`sample_action()` to produce an AI action, and it refuses to run
(`NoPendingMoveError`) unless `lock_player_move()` has already stored
the player's action first. There is no method, property, or attribute
on `RPSMatch` that exposes an AI action before `resolve_pending_round()`
has run — `test_match.py` asserts `hasattr(match, 'ai_action')` is
`False` immediately after locking, before resolving. The frontend
mirror (`RPSMatchEngine` in `rpsEngine.ts`) is a line-for-line port of
this same two-method shape, verified the same way in
`rpsEngine.test.ts`.

### 1.1 The Full Sequence

1. Player selects Rock, Paper, or Scissors in the UI.
2. The app calls `lockPlayerMove()` — the choice is now stored, and
   the choice buttons disable (`ChoicesPanel`'s `disabled` state while
   `phase !== 'idle'`) so a second submission is rejected
   (`MoveAlreadyLockedError`) rather than silently ignored.
3. After a short UI suspense delay (650ms, `REVEAL_DELAY_MS` in
   `useRpsMatch.ts` — purely cosmetic; it does not gate anything
   security-relevant), `resolvePendingRound()` runs: the AI's
   strategy is resolved to a probability distribution and sampled
   **only now**, independently of the player's already-locked choice.
4. Both actions are revealed together (`RoundRevealPanel`).
5. The payoff engine (Phase 8's `resolve_round`, re-exported unchanged)
   determines `PLAYER_WIN` / `AI_WIN` / `TIE`.
6. The scoreboard and match history update from the returned
   `RoundRecord`.

### 1.2 What This Phase Does *Not* Do

No alternating-turn Minimax/Alpha-Beta search is used for standard
RPS anywhere in this phase — there is no "board" or "turn" to search
over; see `docs/RPS_STRATEGY_ENGINE.md` §1 for why that would be the
wrong tool for a simultaneous game. A sequential-reveal variant that
deliberately turns RPS into a toy alternating-turn game to demonstrate
Alpha-Beta mechanics is Phase 11's explicit scope, not this phase's.

## 2. AI Strategy Options

`AIStrategyConfig` (`ai_strategies.py` / `types/rps.ts`) supports four
kinds, selected via `AIStrategyKind`:

| Kind | Distribution | Claim made in the UI |
|---|---|---|
| `NASH_UNIFORM` | (1/3, 1/3, 1/3) | Cannot be exploited *in expectation* by a fixed opponent strategy. **Never** claimed to guarantee winning individual rounds — see `explanation()` / `explainAiStrategy()` wording. |
| `RANDOM_UNIFORM` | (1/3, 1/3, 1/3) — **the same distribution as `NASH_UNIFORM`** | Framed as "plain randomness" rather than game-theoretic optimality, but explicitly stated to play identically to the Nash option — never presented as a distinct strategy mathematically. |
| `CUSTOM` | User-supplied triple, **validated, never normalized** | Exploitable unless it happens to equal (1/3, 1/3, 1/3); the UI says so. |
| `BIASED_DEMO` | Defaults to (0.7, 0.2, 0.1) Rock/Paper/Scissors (`DEFAULT_BIASED_DEMO_PROBABILITIES`), overridable | Explicitly labeled "not an optimal strategy" — a deliberately exploitable demonstration opponent. |

Both `NASH_UNIFORM` and `RANDOM_UNIFORM` call the exact same
`uniform_strategy()` (Phase 8) under the hood
(`AIStrategyConfig.resolve()` / `resolveAiStrategy()`) — one function,
two labels, so the two options can never silently drift apart in
behavior while differing only in their explanatory framing.

**Custom validation never silently normalizes.** `CUSTOM` without
`custom_probabilities` raises `InvalidMatchConfigError`; probabilities
that don't sum to 1 (within Phase 8's `DEFAULT_TOLERANCE = 1e-9`) or
that are negative/non-finite raise `InvalidMixedStrategyError` via
Phase 8's own `MixedStrategy` validation (`validated_strategy()` /
`validatedStrategy()`) — the same contract used everywhere else in the
engine, not a parallel relaxed check invented for this phase.

## 3. Match Configuration and Scorekeeping

`MatchConfig` (`match.py` / `types/rps.ts`): `best_of` + `ai_strategy`.

- `best_of` must be an **odd** integer in `[MIN_BEST_OF, MAX_BEST_OF]
  = [1, 101]` — odd so there is always a decisive winner, and bounded
  so a match configuration can't request an effectively-infinite
  match. `101` is a documented, arbitrary-but-reasonable ceiling (a
  101-round match is already far longer than any UI preset), not a
  value derived from anything deeper.
- `win_threshold = best_of // 2 + 1` (e.g. best-of-5 → 3 wins needed).
  **Ties never count toward this threshold** — `Score.rounds_played`
  (`player_wins + ai_wins + ties`) can exceed `best_of` on an unlucky
  streak of draws, and the match simply continues until someone
  reaches `win_threshold` wins. `test_match.py` verifies this directly
  (five ties in a row on a best-of-3 config leaves the match
  incomplete).
- `RPSMatch.is_complete` is `player_wins >= win_threshold or
  ai_wins >= win_threshold`; `winner` is `None` until then, and both
  `lock_player_move()` and `resolve_pending_round()` raise
  `MatchAlreadyCompleteError` once it's `True` — a completed match
  cannot accept further moves.
- `Score` is a frozen dataclass (`player_wins`, `ai_wins`, `ties`);
  `RoundRecord` snapshots the running score (`score_after`) at the
  moment each round resolved, so match history is an immutable,
  append-only log — the frontend's `history` getter returns a fresh
  tuple/array copy every call, and attempting to mutate a returned
  history entry raises (verified for the Python tuple case in
  `test_match.py`).

## 4. Reproducibility and Randomness

`session.py::create_match(config, seed=None)`:

```python
rng = random.Random(seed) if seed is not None else random.Random()
return RPSMatch(config, rng)
```

- **Test/demo reproducibility:** pass an explicit integer `seed` and
  the entire match (every AI action, for the same sequence of player
  moves) is bit-for-bit reproducible — this is how
  `test_match.py`/`test_session.py` and `rpsEngine.test.ts` get
  deterministic assertions out of an AI that samples randomly.
- **Production play:** no seed is passed, so each match gets its own
  `random.Random()` seeded from OS entropy — never predictable, and
  never read or exposed to the player before their move is locked.
- **No shared global mutable state, ever.** Each `RPSMatch` owns its
  own `random.Random` instance via dependency injection; the engine
  never calls the bare `random.random()`/module-level functions.
  `test_session.py` and `test_match.py` both assert that creating or
  playing matches never touches global random state, and that two
  same-seed matches are independent objects that don't interfere with
  each other.
- The frontend mirrors this exactly: `RPSMatchEngine`'s constructor
  takes a `RandomSource` (defaulting to `Math.random` for real play);
  `createSeededRandom(seed)` (a small mulberry32 PRNG) is used only in
  tests, never in the page component's production path.

## 5. Frontend Gameplay (`RockPaperScissorsPage.tsx`)

A dashboard-theme page (not the dark graph-visualization theme used
for the algorithm workspaces), built from:

- **`ChoicesPanel`** — three large, keyboard/screen-reader-accessible
  buttons (`aria-label`, `aria-pressed`), disabled while a round is
  resolving or the match is complete.
- **`AIStrategyPanel`** — strategy `<select>`, the matching
  explanation text, a live probability-bar breakdown
  (`ProbabilityBar`, reused from Phase 8's visualization components),
  and validated custom-probability inputs with inline `role="alert"`
  feedback — the AI's *strategy configuration* is always visible, but
  never its sampled *action* for the in-progress round.
- **`MatchConfigPanel`** — best-of-3/5/7 presets plus a validated
  custom length; disabled once a match has started (history is
  non-empty) — config changes before the first round reuse
  `startNewMatch()`, since there is nothing to discard yet.
- **`RoundRevealPanel`** — shows the player's own locked choice
  immediately, a "?" placeholder with a spinning animation for the AI
  side during the resolving phase, and only renders the AI's actual
  action once the engine has resolved the round; then shows the result
  sentence (`explainRoundResult`) and the score change.
- **A "Next Round" control** between rounds — the reveal stays on
  screen until the player explicitly advances (`useRpsMatch.nextRound()`,
  which resets the UI phase back to `idle`), so a result is never
  skipped past automatically.
- **`ScoreboardPanel`** — your wins / AI wins / ties / rounds played /
  wins required / status, updated after every resolved round.
- **`MatchHistoryList`** — an immutable, newest-first log of every
  round played this match (round number, both actions, result,
  running score).
- **`FinalResultScreen`** — winner, final score, the configured
  best-of and AI strategy, and a "New Match" action — rendered **only**
  when `match.status === 'COMPLETE'`; never shown mid-match.

A `Badge` at the top of the page reads "Frontend demo — mirrors the
real Python match engine, not yet connected via an API (Phase 12)" —
see §6.

## 6. Frontend/Backend Separation and the Phase 12 Boundary

**Why a frontend-only engine exists at all:** no FastAPI layer exists
yet (explicitly out of scope for this phase, same as every prior
phase), and a browser cannot execute the Python engine directly. So
`frontend/src/lib/rpsEngine.ts` is a deliberate, verified 1:1 port of
`match.py` / `ai_strategies.py` — same validation rules, same
lock/resolve ordering, same win-threshold formula, same "never
silently normalize" contract — not an independent reimplementation
that could drift from the Python engine's behavior. Every rule listed
in §§2-4 above is implemented identically in both languages and
cross-checked by the parallel Python/TypeScript test suites (§7).

This frontend engine is explicitly labeled a demonstration (the page
banner in §5) and is **not** the system of record for Phase 12 or
beyond — it exists only because there is nowhere else for the browser
to compute a match result yet.

**Phase 12 integration boundary (the minimal correct fix, specified
but not built here):** when a FastAPI layer exists, the frontend page
is expected to call a session-backed match API instead of
`RPSMatchEngine`, with the **same** request/response shapes already
defined by the Python types in this phase:

```
POST /api/v1/rps/matches
  body: MatchConfig                     # { bestOf, aiStrategy }
  response: { matchId: string, status: MatchStatus, score: Score }

POST /api/v1/rps/matches/{matchId}/lock
  body: { action: Action }
  response: { locked: true }            # never includes an AI action

POST /api/v1/rps/matches/{matchId}/resolve
  response: RoundRecord                  # samples the AI server-side, here
```

The server-side handler for `/resolve` would call exactly
`RPSMatch.resolve_pending_round()` — the same function this phase
already built and tested — so the simultaneous-action fairness
guarantee in §1 carries over unchanged: the AI's action would be
sampled server-side, inside the one function that's allowed to sample
it, strictly after the client's `/lock` call has been persisted in
session state. No match engine logic would need to change; only the
transport layer is new.

## 7. Security and State-Validation Considerations

- The AI's action for the current round is never stored in any
  frontend state, browser storage, DOM attribute, or (once Phase 12
  exists) API response before the player's move is locked — there is
  structurally nothing to expose until `resolvePendingRound()`/
  `resolve_pending_round()` runs (§1).
- A round is resolved exactly once: `resolvePendingRound()` clears the
  pending move before returning, so a second call with nothing locked
  raises `NoPendingMoveError` rather than resolving a stale or
  duplicate round.
- Double submission is rejected: locking a second move before the
  first resolves raises `MoveAlreadyLockedError`.
- A completed match rejects all further moves
  (`MatchAlreadyCompleteError` from both `lock_player_move()` and
  `resolve_pending_round()`).
- An invalid action value raises `InvalidActionError` rather than
  being coerced or silently accepted.
- Match history is exposed only as copies (`tuple(...)` /
  `[...history]`) — callers cannot mutate recorded rounds through the
  returned reference.
- Match configuration is validated on every construction and on every
  `start_new_match()`/`startNewMatch()` call, never trusted as-is from
  caller input.
- The frontend demo engine's scoring logic is not an independent
  implementation that could contradict the Python engine — it is the
  same rules, ported and cross-tested (§6, §7-adjacent §4).

## 8. Testing

**Backend** — `backend/tests/games/rock_paper_scissors/{test_ai_strategies,
test_match_config, test_match, test_session}.py`, **65 new tests**:
AI strategy resolution and wording (Nash/Random identical distribution,
Custom validation and no-silent-normalization, Biased Demo
default/override), match config validation (threshold for best-of
1/3/5/7/9, odd/even/zero/negative/above-max rejection), all 9
player×AI round combinations, score updates and immutable/ordered
history, match completion at the exact threshold for best-of 3/5/7/9,
ties never counting, AI able to win, completed-match rejection,
double-submission/double-resolution/nothing-locked/invalid-action
rejection, AI-action-not-present-before-resolution
(`hasattr(match, 'ai_action')` is `False`), `start_new_match` reset,
seed reproducibility, and global-random-state isolation.

**Frontend** — `frontend/src/lib/rpsEngine.test.ts` (**31 tests**,
the TypeScript mirror of the above) and
`frontend/src/features/games/rock-paper-scissors/RockPaperScissorsPage.test.tsx`
(**8 tests**): rendering the three choice buttons and an empty
scoreboard, locking a move and keeping the AI side hidden until the
reveal delay elapses, scoreboard/history updates after a round,
reaching the final result screen and starting a new match, match
configuration controls working before any round is played and locking
once one has, AI strategy selection updating the explanation and
probability bars, and custom-strategy validation rejecting an invalid
distribution with visible feedback.

Run with:

```bash
# backend
cd backend
pytest tests/games/rock_paper_scissors/ -v   # this phase's new tests only
pytest                                        # full backend suite

# frontend
cd frontend
npx vitest run                                # full frontend suite
npx vitest run src/lib/rpsEngine.test.ts
npx vitest run src/features/games/rock-paper-scissors/RockPaperScissorsPage.test.tsx
```

Full backend suite after this phase: **332 passed** (267 prior + 65
new), 0 failed. Full frontend suite: **82 passed** (9 test files).

## 9. Known Limitations

- Human-vs-human play, the payoff-matrix view, and the mixed-strategy
  probability visualization are explicitly Phase 10's scope, not
  built here (§0).
- No FastAPI endpoint exists; the frontend uses the
  clearly-labeled demo engine described in §6 until Phase 12.
- No persistence: a match (score, history, config) lives only in the
  `RPSMatchEngine` instance held by `useRpsMatch`'s React state for the
  lifetime of the page — a refresh starts a new match.
- The ~650ms reveal delay in `useRpsMatch.ts` is a fixed UI pacing
  constant, not a configurable or physically meaningful value.
- `MAX_BEST_OF = 101` is a documented, deliberately generous ceiling
  to prevent unbounded match configurations — it is not derived from
  any performance or correctness constraint.
