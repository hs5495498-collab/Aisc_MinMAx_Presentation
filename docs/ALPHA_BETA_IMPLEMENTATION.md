# Alpha-Beta Pruning Implementation (Phase 6)

Location: `backend/app/algorithms/alpha_beta/`. A second, independent
search algorithm over the same Tic-Tac-Toe engine used by Minimax
(Phase 5) — not a modification of Minimax, and not a modification of
the engine. This document describes it as actually implemented.

## 1. Alpha-Beta Theory

Alpha-Beta Pruning is Minimax with two running bounds threaded through
the recursion:

- **alpha** — the best score MAX can *guarantee* along the path
  explored so far.
- **beta** — the best score MIN can *guarantee* along the path
  explored so far.

Whenever `alpha >= beta` at a node, the player to move at the node
*above* it would never actually let play reach any of that node's
remaining unexplored children — so they can be skipped without
changing the final answer. This is the entire algorithm: identical
MAX/MIN decisions to Minimax, plus this one additional "don't bother"
condition.

## 2. Alpha and Beta Bounds

Initial call: `alpha = -∞`, `beta = +∞` (nothing is ruled out yet).
Both bounds only ever move *toward each other* as the search proceeds
(`alpha` only increases, `beta` only decreases), and both are passed
by value down each recursive call and restored implicitly on return
(no explicit "undo" needed for the bounds themselves — only the board,
via `game.undo()`).

## 3. MAX/MIN Recursion

`solver._alpha_beta(game, ai_mark, depth, alpha, beta, stats, observer)`:

**MAX node** (`game.current_player == ai_mark`):
1. `value = -∞`
2. For each legal move (row-major order): play it, recurse, undo it.
3. `value = max(value, child_value)`
4. `alpha = max(alpha, value)`
5. If `alpha >= beta`: stop exploring remaining moves (cutoff).
6. Return `value`.

**MIN node** (opponent's turn):
1. `value = +∞`
2. For each legal move: play it, recurse, undo it.
3. `value = min(value, child_value)`
4. `beta = min(beta, value)`
5. If `beta <= alpha` (equivalently `alpha >= beta`): stop exploring
   remaining moves (cutoff).
6. Return `value`.

This is exactly the 7-step MAX/MIN procedure specified in the Phase 6
brief, implemented without reversing the MAX/MIN update directions or
the cutoff comparison (`TestPruningMechanics.test_both_max_and_min_node_cutoffs_occur`
and `test_alpha_and_beta_are_actually_updated_during_search` verify
both roles' bounds genuinely move in the correct direction during a
real search, via the observer interface — see §9).

## 4. Pruning Conditions

A cutoff happens precisely when `alpha >= beta`, checked once per move
iteration, immediately after that move's returned value has already
been folded into `value`/`alpha`/`beta`. The root call is a MAX node
with no ancestor MIN bound, so `beta` stays `+∞` throughout the root's
own loop and a root-level cutoff is structurally impossible — pruning
only ever happens strictly below the root, where some ancestor
constraint actually exists.

## 5. Evaluation Consistency with Minimax

`alpha_beta/solver.py` imports `evaluate_terminal` directly from
`app.algorithms.minimax.evaluator` — it is the exact same function
object, not a re-implementation:

```python
from app.algorithms.minimax.evaluator import evaluate_terminal
```

`test_alpha_beta_reuses_the_exact_minimax_evaluator_function` asserts
`ab_solver.evaluate_terminal is mm_evaluator.evaluate_terminal` (object
identity, not just equal behavior). This makes it structurally
impossible for the two algorithms to silently drift onto different
scoring conventions — win = `10 - depth`, loss = `depth - 10`, draw =
`0`, from `ai_mark`'s perspective, identically in both.

Both solvers also share: the same engine interfaces
(`legal_moves()`/`make_move()`/`undo()`/`is_game_over`/`current_player`
/`status`/`winner`), the same `copy.deepcopy`-based clone adapter
pattern, the same exceptions (`alpha_beta.exceptions` re-exports
Minimax's `GameOverError`/`NotAITurnError` rather than duplicating
them), and the same row-major move ordering (§7).

## 6. Best-Move Selection

`solver.find_best_move(game, ai_player, observer=None)` — identical
contract to Minimax's: validates game-over and whose-turn-it-is first
(no mutation on failure), searches a deep copy, and returns an
immutable `AlphaBetaResult`.

## 7. Move Ordering

The baseline uses `game.legal_moves()` directly — the exact same
row-major order Minimax uses — with no heuristic reordering. This was
a deliberate choice for a fair Phase 5-vs-6 comparison: any node-count
difference between the two is attributable only to pruning, never to
a better move order finding cutoffs faster. (A heuristic-ordering
experimental mode, if added later, must be a separate, clearly-labeled
opt-in mode — not the default — per the Phase 6 brief; none was added
in this phase.)

## 8. Pruning and Search Statistics

Defined in `models.AlphaBetaStats`, frozen into `AlphaBetaResult`:

| Field | Meaning |
|---|---|
| `nodes_visited` | Every search-node entry, including the root. Same definition as Minimax. |
| `terminal_nodes` | Terminal positions evaluated. Same definition as Minimax. |
| `leaves_evaluated` | Evaluator calls — equal to `terminal_nodes` here, same definition as Minimax. |
| `moves_considered` | Successor moves actually recursed into (not skipped by a cutoff). |
| `maximum_search_depth` | Deepest recursion level reached. |
| `alpha_beta_cutoffs` | Number of **cutoff events** — how many times, at any node, `alpha >= beta` caused the remaining not-yet-explored siblings to be skipped. |
| `branches_pruned` | Number of **individual successor branches** actually skipped as a result of those cutoffs — `sum(remaining siblings skipped)` over every cutoff event. |

**These two are deliberately different numbers.** One cutoff event
with 3 remaining siblings contributes `1` to `alpha_beta_cutoffs` and
`3` to `branches_pruned`. `TestPruningMechanics.test_cutoffs_and_branches_pruned_are_distinct_counts`
asserts `branches_pruned >= alpha_beta_cutoffs`, and
`test_observer_event_counts_match_reported_statistics` independently
confirms both counters exactly match the number of real
`on_cutoff_triggered`/`on_branch_pruned` events the observer actually
received — i.e. the statistics are not just plausible-looking numbers,
they match the literal events that occurred.

`execution_time_ms` uses `time.perf_counter()` (monotonic,
sub-millisecond resolution), reported in milliseconds, over the whole
`find_best_move` call.

## 9. Observer / Future Visualization Events

`observer.SearchObserver` extends Minimax's event set with
pruning-specific events: `on_node_entered` (now also carrying the
current `alpha`/`beta`), `on_move_explored`, `on_terminal_evaluated`,
`on_alpha_updated`, `on_beta_updated`, `on_cutoff_triggered` (role,
alpha, beta, reason), `on_branch_pruned` (one call per actually-skipped
move), `on_value_returned`, `on_best_move_updated`. All are real,
solver-fired events — Phase 6's own tests use a `_RecordingObserver`
to prove the fired events exactly match the reported statistics (§8).
No visualization UI, graph library, or React code was added; Phase 7
is expected to implement a concrete `SearchObserver` that records
these events for the frontend's search-tree canvas.

## 10. Complexity and Benchmark Summary

Pruning does not change the worst-case asymptotic complexity of
Minimax, but it substantially reduces nodes actually visited in
practice — how much depends entirely on the position and move order.
See `docs/ALGORITHM_COMPARISON.md` for the full 7-position benchmark;
headline result: on the empty board, Alpha-Beta visits 20,866 nodes
versus Minimax's 549,946 (a 96.21% reduction) while returning the
*exact same* evaluation (`0`, a draw) and the *exact same* best move
(`(0, 0)`).

## 11. Testing

`backend/tests/algorithms/test_alpha_beta.py` — **48 tests**:
evaluator-identity, correctness (immediate win/block, a genuine
forced-win-then-forced-loss pair built from the classic fork trap,
draw, illegal-move rejection, both exceptions), pruning mechanics
(cutoffs occur on both MAX and MIN nodes, alpha/beta genuinely move,
observer-vs-statistics consistency, an exact hand-derived
zero-pruning case with only one legal move, and the exact empty-board
benchmark numbers), consistency-with-Minimax across 10 reachable
positions (both evaluations *and* best moves matched on every one
tested), state safety/determinism, statistics sanity, and exhaustive
verification (AI=X and AI=O, plus an Alpha-Beta-vs-Minimax self-play
game ending in a draw). `backend/tests/algorithms/test_comparison.py`
— **18 tests** covering the comparison utility and the required
seven-position benchmark. Combined with the existing 56 engine + 27
Minimax tests: **149 passed**, full backend suite, ~228 seconds
(dominated by the exhaustive checks across both algorithms).

## 12. Limitations

- `copy.deepcopy` per `find_best_move` call carries the same modest
  overhead as Minimax's equivalent adapter.
- No heuristic move ordering, transposition table, or caching — by
  design, to keep the Phase 5/6 comparison fair (see §7 and
  docs/ALGORITHM_COMPARISON.md).
- Tic-Tac-Toe's tree is small enough that even the unpruned Minimax
  baseline terminates in ~17.5 seconds; the practical benefit of
  pruning demonstrated here is about node-count reduction and
  wall-clock speedup (~30x on the empty board), not about making an
  otherwise-intractable search tractable.
