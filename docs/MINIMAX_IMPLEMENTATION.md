# Minimax Implementation (Phase 5)

Location: `backend/app/algorithms/minimax/`. Standard, **unpruned**
Minimax for Tic-Tac-Toe, built entirely on top of the existing engine
(`backend/app/games/tic_tac_toe/`) via its public interface. No
Alpha-Beta Pruning exists anywhere in this module — see §13.

## 1. Minimax Theory

Tic-Tac-Toe is a two-player, alternating-turn, zero-sum,
perfect-information game: at every point, both players see the full
board, exactly one player moves, and one player's gain is exactly the
other's loss. Minimax solves such games by recursively assuming each
player plays optimally for themselves, all the way to every possible
terminal state, then propagating terminal scores back up the tree.

## 2. MAX and MIN Roles

- **MAX** — the AI (`ai_mark`, the player `find_best_move` is solving
  for). At a MAX node, the algorithm picks the child with the
  **highest** score.
- **MIN** — the opponent (`ai_mark.opponent()`). At a MIN node, the
  algorithm picks the child with the **lowest** score, modeling an
  opponent who plays to minimize the AI's outcome (equivalently,
  maximize their own).

Role is determined per-node by comparing `game.current_player` to
`ai_mark`, not by depth parity — this stays correct regardless of
which player (`X` or `O`) is the AI.

## 3. Evaluation Function

Implemented in `evaluator.evaluate_terminal(game, ai_mark, depth)`,
called only on terminal positions (`game.is_game_over` is `True`):

| Outcome | Score |
|---|---|
| Draw | `0` |
| `ai_mark` wins | `10 - depth` |
| `ai_mark` loses | `depth - 10` |

`WIN_SCORE = 10`. Calling it on a non-terminal position raises
`ValueError` — it is a programming error, not a legal "I don't know"
case.

## 4. Depth-Based Terminal Scoring

`depth` is the number of plies from the position being searched
(depth 0, the root passed to `find_best_move`) to the terminal node.
Because `10 - depth` strictly decreases as `depth` grows, a win found
sooner always outscores a win found later; because `depth - 10`
strictly increases as `depth` grows, a loss suffered later always
outscores (is less bad than) a loss suffered sooner. A draw is `0`
regardless of depth — a draw found quickly is not "better" than one
found slowly, since the only thing worth preferring faster/slower is
winning/losing, not a neutral outcome.

`TestTerminalEvaluation` (in `backend/tests/algorithms/test_minimax.py`)
directly tests both directions: `test_faster_win_scores_higher_than_slower_win`
and `test_slower_loss_scores_higher_than_faster_loss`.

## 5. Recursive Algorithm

`solver._minimax(game, ai_mark, depth, stats, observer)`:

1. Count this node (`stats.nodes_visited += 1`), record depth.
2. If `game.is_game_over`: score it with `evaluate_terminal`, count it
   as a terminal node/leaf, return the score.
3. Otherwise determine MAX/MIN from `game.current_player`.
4. For every `(row, col)` in `game.legal_moves()` (already row-major):
   play it (`game.make_move`), recurse one ply deeper, undo it
   (`game.undo()`), and fold the returned value into the running
   best-so-far with `max`/`min` depending on role.
5. Return the best-so-far.

`game` is mutated with `make_move`/`undo` *during* recursion but is
always restored before the call returns — by design, a call to
`_minimax` never leaves `game` any different than it found it.
`find_best_move` additionally runs this entire search against a
**deep copy** of the caller's game (see §6), so the caller's original
object is untouched regardless.

No `alpha`/`beta` parameters exist anywhere in this function's
signature or body, and every iteration of the `for` loop runs to
completion — there is no `break`, no bound check, no early exit based
on a comparison between branches.

## 6. Best-Move Selection

`solver.find_best_move(game, ai_player, observer=None)`:

1. Resolve `ai_player` to a `Mark`.
2. Reject immediately (before touching anything) if `game.is_game_over`
   (`GameOverError`) or if it isn't actually `ai_player`'s turn
   (`NotAITurnError`).
3. Clone `game` via `copy.deepcopy` — the **only** place this module
   reaches outside the engine's public methods, and it treats
   `TicTacToeGame` as an opaque object rather than reading its private
   fields, so it keeps working even if the engine's internal
   representation changes.
4. Run the same root-level MAX loop `_minimax` would run (the root is
   always a MAX node from `ai_mark`'s perspective, since we just
   validated it's `ai_mark`'s turn), tracking which move produced the
   best score.
5. Freeze the accumulated statistics and timing into an immutable
   `MinimaxResult`.

## 7. Tie-Breaking

`game.legal_moves()` enumerates cells in row-major order (smallest row
first, then smallest column — see `docs/TIC_TAC_TOE_ENGINE.md` §4).
The root loop only replaces `best_move` on a **strictly greater**
score (`score > best_score`), so among several moves with equal
Minimax value, the first one encountered in row-major order is kept.
`TestDeterminism.test_tie_breaking_prefers_row_major_order_on_an_empty_board`
verifies this directly: every one of the 9 opening moves has value `0`
(Tic-Tac-Toe is a draw under perfect play, from *any* opening move),
and the solver deterministically returns `(0, 0)`.

## 8. Search Statistics

Collected in `models.SearchStats`, frozen into `MinimaxResult`:

| Field | Meaning |
|---|---|
| `nodes_visited` | Every search-node entry, including the root. |
| `terminal_nodes` | Terminal (won/lost/drawn) positions reached. |
| `leaves_evaluated` | Evaluator-function invocations. Always equal to `terminal_nodes` in this unpruned baseline (every terminal node is scored exactly once, no caching) — tracked as its own field because Phase 6's Alpha-Beta comparison wants both terminology slots available. |
| `moves_considered` | Successor moves actually explored (recursed into), not just the count of empty cells. |
| `maximum_search_depth` | Deepest recursion level reached (root = depth 0). |
| `execution_time_ms` | Wall-clock time for the whole `find_best_move` call, measured with `time.perf_counter()` (monotonic, sub-millisecond resolution), reported in milliseconds. |

## 9. Complexity Analysis

Standard Minimax with no pruning visits **every** node of the game
tree below the search root — there is no asymptotic improvement over
brute-force enumeration; its value is correctness and simplicity, not
efficiency (that's Phase 6's job). From the empty board, this
implementation visits exactly **549,946 nodes** and reaches exactly
**255,168 terminal leaves** (captured directly from a real run — see
§10) — which match the well-known, independently published totals for
the complete Tic-Tac-Toe game tree. That match is strong external
evidence the implementation explores the real game tree exhaustively
and correctly, not a fabricated or partial one.

## 10. Example Execution

Real output from an actual run (not fabricated):

```python
from app.games.tic_tac_toe import TicTacToeGame
from app.algorithms.minimax import find_best_move

game = TicTacToeGame()
game.make_move(0, 0)  # X
game.make_move(1, 0)  # O
game.make_move(0, 1)  # X
game.make_move(1, 1)  # O

result = find_best_move(game, "X")
print(result)
```

```
Minimax(X vs O): move=(0,2) evaluation=9 nodes_visited=157 terminal_nodes=73 depth=5 time=4.381ms
```

`result.to_dict()`:

```json
{
  "best_move": { "row": 0, "col": 2 },
  "evaluation": 9,
  "ai_player": "X",
  "opponent_player": "O",
  "statistics": {
    "nodes_visited": 157,
    "terminal_nodes": 73,
    "leaves_evaluated": 73,
    "moves_considered": 156,
    "maximum_search_depth": 5,
    "execution_time_ms": 4.3806
  }
}
```

`evaluation = 9 = 10 - 1`: X's winning move is found at depth 1 from
this root (one ply deep), matching §3-4's scoring convention exactly.

A search from the **empty board** (`find_best_move(TicTacToeGame(), "X")`)
visited `nodes_visited=549946`, `terminal_nodes=255168`,
`maximum_search_depth=9`, `evaluation=0` (a draw, as Tic-Tac-Toe
always is under perfect play), `best_move=(0, 0)` (row-major
tie-break among 9 equally-drawn opening moves), in ~17.5 seconds on
the development machine — the real cost of a genuinely unpruned
full-tree search, and the baseline Phase 6's Alpha-Beta will be
measured against.

## 11. Testing and Optimality Verification

`backend/tests/algorithms/test_minimax.py` — **27 tests**, all
passing, organized into `TestTerminalEvaluation`, `TestOptimalDecisions`
(immediate win, immediate block, the textbook "double corner trap,"
illegal-move rejection, both exception types), `TestGameStateCorrectness`
(the caller's `game.to_dict()` is byte-for-byte identical before and
after a search), `TestDeterminism`, `TestSearchStatistics` (including
one position with exactly one legal move, where every statistic is
hand-verified to an exact expected integer), and
`TestExhaustiveVerification`.

**Exhaustive verification method:** for a fixed AI mark, recursively
branch over **every** legal move at every opponent turn (not just one
scripted opponent), and at every AI turn, play the AI's *actual*
`find_best_move` choice. At every resulting terminal leaf, assert the
AI did not lose. This was run for `ai_player="X"` and `ai_player="O"`
separately, plus a direct Minimax-vs-Minimax self-play game asserting
a draw. A test-harness-only transposition cache (keyed by board state,
reusing an already-computed decision when the exhaustive walk revisits
the exact same board via a different move order) was added after an
uncached first run took **3 hours 7 minutes** — the cache does not
touch the solver and does not weaken the proof (every distinct
position is still resolved by a real call to `find_best_move`; only
exact repeats of an already-resolved position are skipped).

**Exact counts from the real run** (`pytest -s`, reproducible):

| Check | nodes_visited | terminal_leaves_checked | distinct AI positions searched | cache hits |
|---|---|---|---|---|
| AI = X | 182 | 73 | 81 | 10 |
| AI = O | 1,720 | 569 | 426 | 342 |

Both exhaustive checks passed — the Minimax AI never loses against any
opponent strategy, as either X or O. The separate self-play test
confirms Minimax-vs-Minimax always ends in a draw, as Tic-Tac-Toe
game theory predicts. Full backend suite: **83 passed** (56 engine +
27 Minimax), runtime ~98-103 seconds, dominated by the exhaustive
checks above.

No coverage-percentage tool was run; all results above are exact
pass/fail counts and printed statistics from real executions.

## 12. Future Search-Tree Visualization Integration

`observer.SearchObserver` defines five hook points — `on_node_entered`,
`on_move_explored`, `on_terminal_evaluated`, `on_value_returned`,
`on_best_move_updated` — that `solver._minimax`/`find_best_move`
already call when a `SearchObserver` is passed in (default `None`,
which adds no observable overhead via a plain `is not None` check at
each call site). Phase 7 can implement a concrete `SearchObserver`
that appends each event to a list in the exact shape
`docs/SEARCH_VISUALIZATION_DESIGN.md` already specifies, then hand
that recorded, **genuine** event log to the frontend's search-tree
canvas — no fabricated tree, no React code, no graph library added
here.

## 13. Why This Implementation Does Not Use Alpha-Beta Pruning

This is Phase 5's explicit, mandatory scope boundary: produce a
**genuine, unpruned baseline** so Phase 6's Alpha-Beta implementation
has something real to be measured against. Concretely, in this module:

- `_minimax` and `find_best_move` take no `alpha`/`beta` parameters.
- The `for row, col in game.legal_moves()` loop always runs to
  completion — there is no `break`, no bound comparison, no early
  exit.
- No shared pruning utility exists; Phase 6 is expected to implement
  Alpha-Beta as its own independent module (or via carefully separated
  shared *evaluation* utilities, like `evaluator.evaluate_terminal`,
  never shared *search/pruning* logic).
- The empty-board search visiting exactly the textbook 549,946-node /
  255,168-leaf full game tree (§9, §10) is itself evidence no pruning
  occurred — a pruned search would visit measurably fewer nodes.
