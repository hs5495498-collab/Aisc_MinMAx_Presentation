# Rock Paper Scissors Strategy Engine (Phase 8)

Location: `backend/app/games/rock_paper_scissors/`. A pure-Python,
game-theory-only engine — payoff matrix, mixed strategies, expected
payoff, best response, Nash equilibrium, and exploitability. **No
gameplay session, no human-vs-AI interaction, and no HTTP layer exist
here** (Phase 9+). This document describes the engine as actually
implemented.

## 1. Standard RPS Is Simultaneous, Not Sequential — and Why That Matters Here

Standard, one-round Rock Paper Scissors is a **simultaneous-action**
game: both players commit a choice without observing the other's. This
is fundamentally different from Tic-Tac-Toe's alternating,
perfect-information structure, which is exactly what makes
Minimax/Alpha-Beta applicable there (see `docs/GAME_THEORY_DESIGN.md`).

**This module never uses alternating-turn search.** There is no
"board," no "turn," and no call into `app.algorithms.minimax` or
`app.algorithms.alpha_beta` anywhere in
`backend/app/games/rock_paper_scissors/`. Standard RPS is solved with
a payoff matrix and mixed-strategy equilibrium analysis instead — the
mathematically correct tool for a simultaneous game. An educational
*sequential* variant (where one player's choice is artificially
revealed first, turning it into a toy alternating-turn game purely to
demonstrate Alpha-Beta mechanics) is explicitly **Phase 11's** scope,
not this phase's.

## 2. Mathematical Model

### 2.1 Actions and Ordering

`Action` (`models.py`) is a three-value string enum:
`ROCK`, `PAPER`, `SCISSORS`. `ACTIONS = (ROCK, PAPER, SCISSORS)` is the
one canonical ordering used everywhere a fixed order matters (payoff
matrix indexing, probability tuples).

### 2.2 Payoff Matrix

`payoff.py`'s `PAYOFF_MATRIX`, from Player A's perspective
(`PAYOFF_MATRIX[a][b]`):

| A ＼ B | Rock | Paper | Scissors |
|---|---:|---:|---:|
| Rock | 0 | -1 | +1 |
| Paper | +1 | 0 | -1 |
| Scissors | -1 | +1 | 0 |

### 2.3 Zero-Sum Property

`payoff_b(a, b)` is defined as `-payoff_a(a, b)` — structurally, not as
an independently-maintained table that could drift. `test_payoff.py`
verifies this for all 9 action pairs, plus the stronger
`payoff_a(a, b) == -payoff_a(b, a)` (swapping which player is "A").

### 2.4 Pure and Mixed Strategies

A **pure strategy** is "always play X." A **mixed strategy** is a
probability distribution over `{ROCK, PAPER, SCISSORS}`. This engine
represents a pure strategy as the *degenerate* mixed strategy
`MixedStrategy.pure(action)` (probability 1 on one action, 0 on the
others) — so every calculation (expected payoff, best response) has
exactly **one** implementation that handles pure-vs-pure, pure-vs-mixed,
mixed-vs-pure, and mixed-vs-mixed uniformly, rather than four
parallel code paths that could disagree.

`MixedStrategy` (`models.py`) validates on construction:

- Exactly the three actions in `ACTIONS` are present.
- Every probability is finite (rejects `NaN` and `±inf`).
- No probability is negative.
- The probabilities sum to `1` within `DEFAULT_TOLERANCE = 1e-9`.

**Never silently normalized.** The default constructor
(`MixedStrategy(...)`/`from_mapping(...)`) rejects an invalid
distribution outright — it never rescales it into validity behind your
back. The *only* place this engine normalizes anything is the
explicitly-named `MixedStrategy.from_unnormalized(weights)`, which a
caller must opt into by name.

## 3. Expected Payoff

`analysis.py`'s `expected_payoff_a(strategy_a, strategy_b)` computes
the bilinear form:

```
Expected payoff = pᵀ A q = Σ_a Σ_b p(a) · A[a][b] · q(b)
```

`expected_payoff_b(...) = -expected_payoff_a(...)` (zero-sum). A
generic `expected_payoff(player, strategy_a, strategy_b)` dispatches to
whichever side you need.

**Hand-calculable example** (from `test_analysis.py`): A plays
`(0.5, 0.5, 0.0)` (half Rock, half Paper), B plays `(0.0, 0.5, 0.5)`
(half Paper, half Scissors):

```
Rock    vs Paper    : -1 × 0.5 × 0.5 = -0.25
Rock    vs Scissors :  1 × 0.5 × 0.5 = +0.25
Paper   vs Paper    :  0 × 0.5 × 0.5 =  0
Paper   vs Scissors : -1 × 0.5 × 0.5 = -0.25
                                     -------
                                      -0.25
```

`expected_payoff_a` returns exactly `-0.25`; `expected_payoff_b`
returns `+0.25`.

## 4. Best Response

`best_response(player, opponent_strategy, tolerance=DEFAULT_TOLERANCE)`
computes `player`'s expected payoff for *every* pure action against a
fixed `opponent_strategy`, then returns every action within
`tolerance` of the maximum as `best_actions` — a genuine tie (e.g.
responding to the uniform strategy, where all three actions pay 0) is
never arbitrarily broken; the full tied set is preserved, and
`BestResponseResult.is_tied` reports whether more than one action tied.

| Opponent plays | Best response |
|---|---|
| Pure Rock | Paper only |
| Pure Paper | Scissors only |
| Pure Scissors | Rock only |
| Uniform (1/3, 1/3, 1/3) | Rock, Paper, *and* Scissors (3-way tie) |

Works for either `Player.A` or `Player.B` — `Player.B`'s best response
is computed via `expected_payoff_b`, so the zero-sum convention is
respected rather than re-derived with a sign error.

## 5. Nash Equilibrium Derivation

`equilibrium.py`'s `derive_uniform_equilibrium()` **derives** the
equilibrium rather than returning a hardcoded constant with no
justification:

**Symmetry argument:** `PAYOFF_MATRIX` is invariant under the cyclic
relabeling Rock→Paper→Scissors→Rock — `PAYOFF_MATRIX[PAPER]` is
exactly `PAYOFF_MATRIX[ROCK]` with every action label shifted by that
cycle (check: `{ROCK:0,PAPER:-1,SCISSORS:1}` cycled becomes
`{PAPER:0,SCISSORS:-1,ROCK:1}`, i.e. `{ROCK:1,PAPER:0,SCISSORS:-1}` —
exactly `PAYOFF_MATRIX[PAPER]`). Because the game's structure is
unchanged by this relabeling, any equilibrium must be too — which is
only possible if all three actions carry **equal** probability. That
forces `(1/3, 1/3, 1/3)`, for both players (the game is symmetric
between A and B as well).

**Exact-rational proof, not just float-close:**
`exact_game_value_at_uniform()` computes the game value at the uniform
strategy using `fractions.Fraction` over the integer payoff matrix —
the result is `Fraction(0, 1)` **exactly**, with no floating-point
tolerance involved at all.

**Independent verification, not a hardcoded assertion:**
`verify_equilibrium(strategy_a, strategy_b, tolerance)` recomputes
both players' best responses from scratch and checks the standard
condition — a mixed strategy is a best response iff every action in
its *support* (played with positive probability) achieves the maximum
available payoff. It does not special-case `(1/3,1/3,1/3)`; a wrong
candidate (e.g. "always Rock") is correctly rejected
(`test_equilibrium.py::test_always_rock_fails_verification`).

## 6. Exploitability

**Definition and sign convention** (documented once, used
consistently — `analysis.py::exploitability`):

> `exploitability(strategy, player)` = the best expected payoff
> `player`'s **opponent** can guarantee by best-responding to
> `strategy`, minus the equilibrium game value (`0`).

This is always **non-negative**: every row and column of
`PAYOFF_MATRIX` sums to exactly `0`, so the uniform strategy earns
exactly `0` against *any* fixed opponent strategy — meaning the
opponent can always guarantee at least `0` (by playing uniform
themselves), so their best response can never do worse than `0`. A
result of `0` (within tolerance) means `strategy` cannot be profitably
exploited; a positive result is the opponent's per-round expected
profit from exploiting it.

| Strategy | Exploitability | Opponent's best response |
|---|---|---|
| Uniform (1/3, 1/3, 1/3) | `0` | (tied across all three — none is better than the others) |
| Always Rock | `+1` | Paper |
| Biased (0.6, 0.2, 0.2) | `> 0` (computed, not hardcoded) | whatever `best_response` finds |

## 7. Random Strategy Sampling — Kept Separate From the Math

`strategy.py` is deliberately a separate module from `analysis.py`/
`equilibrium.py`: **sampling an action is a random draw, never a
substitute for equilibrium computation.** `sample_action(strategy, rng)`
takes a caller-supplied `random.Random` instance and never reads or
writes any global random state —
`test_strategy.py::test_sampling_never_touches_global_random_state`
verifies this directly. `random.Random(seed)` gives a fully
reproducible sequence (`sample_actions(strategy, random.Random(42), n)`
always returns the same `n` actions for the same seed).

## 8. Numerical Tolerance

One constant, `DEFAULT_TOLERANCE = 1e-9` (`models.py`), used
everywhere a floating-point comparison is needed: probability-sum
validation, best-response tie detection, and equilibrium
verification. The one place this engine avoids floating point
entirely is `exact_game_value_at_uniform()`, which uses
`fractions.Fraction` for an exact proof of the specific `(1/3,1/3,1/3)`
claim (§5) — general mixed strategies still use floats, documented
here as the practical choice for arbitrary (non-nicely-fractional)
distributions.

## 9. Module Architecture (API-Independent)

```
backend/app/games/rock_paper_scissors/
  models.py       Action, Player, RoundOutcome, MixedStrategy (+ validation)
  exceptions.py   RPSError, InvalidActionError, InvalidMixedStrategyError
  payoff.py       PAYOFF_MATRIX, payoff_a, payoff_b, resolve_round
  analysis.py     expected_payoff(_a/_b), best_response, exploitability
  equilibrium.py  derive_uniform_equilibrium, exact_game_value_at_uniform, verify_equilibrium
  strategy.py     uniform_strategy, validated_strategy, sample_action(s)
```

Pure Python, zero new runtime dependencies (same `pytest`-only
`requirements.txt` as every prior phase). No FastAPI import anywhere in
this package — matching the Tic-Tac-Toe engine and Minimax/Alpha-Beta
modules' existing architecture rather than inventing a second one.

## 10. Example Calculations (Real, Executed Output)

```python
from app.games.rock_paper_scissors import (
    Action, Player, MixedStrategy, payoff_a, best_response, exploitability, verify_equilibrium,
)

payoff_a(Action.ROCK, Action.SCISSORS)              # 1  (Rock beats Scissors)

best_response(Player.A, MixedStrategy.pure(Action.ROCK)).best_actions
# (Action.PAPER,)

exploitability(MixedStrategy.pure(Action.ROCK), Player.A).exploitability
# 1.0 — always playing Rock lets the opponent win every round by playing Paper

exploitability(MixedStrategy.uniform(), Player.A).exploitability
# 0.0 (within tolerance) — the uniform strategy cannot be profitably exploited

verify_equilibrium(MixedStrategy.uniform(), MixedStrategy.uniform()).is_equilibrium
# True
```

## 11. Testing

`backend/tests/games/rock_paper_scissors/` — **91 tests** across
`test_payoff.py` (all 9 combinations, zero-sum consistency, invalid
actions), `test_models.py` (valid/invalid mixed strategies, NaN/inf/
negative/wrong-count/sum-mismatch rejection, explicit-only
normalization), `test_analysis.py` (expected payoff for all four
pure/mixed combinations including hand-calculated examples, best
response including ties, exploitability including non-negativity),
`test_equilibrium.py` (derivation, exact-rational proof, verification
of both correct and incorrect candidates), and `test_strategy.py`
(seed reproducibility, global-state isolation, empirical frequencies
with a deliberately generous ±3% statistical tolerance to avoid
flakiness).

Run with:

```bash
cd backend
pytest tests/games/rock_paper_scissors/ -v   # this module only
pytest                                        # full backend suite
```

Full backend suite after this phase: **267 passed** (176 prior + 91
new), 0 failed.

## 12. Known Limitations

- No gameplay session, no human-vs-AI loop, no FastAPI endpoint —
  explicitly Phase 9+.
- `verify_equilibrium` is a specialized exact check for this 3-action
  symmetric zero-sum game (support-optimality condition), not a
  general linear-programming-based equilibrium *solver* for arbitrary
  matrix games — deliberately, per the Phase 8 brief's instruction not
  to build unnecessary general machinery for a 3-action game.
- `exploitability` is defined and signed consistently for this
  zero-sum game specifically (relative to the equilibrium value, which
  is `0` for both players here); it is not a general-purpose metric
  claimed to generalize to non-zero-sum games.
