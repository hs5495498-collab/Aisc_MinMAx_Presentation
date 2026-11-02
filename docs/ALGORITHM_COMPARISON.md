# Minimax vs. Alpha-Beta Comparison (Phase 6)

Utility: `backend/app/algorithms/comparison.py`
(`compare_algorithms(game, ai_player, position_label=None)` →
`ComparisonResult`). Tests and the reproducible benchmark:
`backend/tests/algorithms/test_comparison.py`. All numbers in this
document are copied directly from real `pytest -s` output, not
invented or estimated.

## Methodology

`compare_algorithms` runs `app.algorithms.minimax.find_best_move` and
`app.algorithms.alpha_beta.find_best_move` on the *same* `game` object
and the same `ai_player`, one after the other. Because each solver
already clones its input internally and never mutates it (proven by
each algorithm's own `TestStateSafety`/`TestGameStateCorrectness`
tests), passing the same object to both already gives each one an
independent copy of the identical starting position — no extra
cloning step was needed in the comparison utility itself.

Both solvers use identical row-major move ordering (`game.legal_moves()`)
and identical scoring (Alpha-Beta imports Minimax's `evaluate_terminal`
function object directly — see `docs/ALPHA_BETA_IMPLEMENTATION.md` §5).
This isolates the *only* variable being measured to pruning itself.

**Node reduction percentage:** `((minimax_nodes - alpha_beta_nodes) / minimax_nodes) * 100`,
computed by `_safe_percentage_reduction`, which returns `0.0` instead
of dividing by zero when `minimax_nodes == 0` (not possible in
practice — the root is always counted — but handled regardless).

## The Seven-Position Benchmark

Positions chosen to cover: the full empty-board tree, an early-game
position, a mid-game position, a forced-win opportunity, a
forced-block requirement, a late-game nearly-full board, and a
position with a visibly large pruning opportunity. Real output from
`pytest -s tests/algorithms/test_comparison.py::TestSevenPositionBenchmark`:

| # | Position | Minimax nodes | Alpha-Beta nodes | Node reduction | Cutoffs | Branches pruned | Evaluations match | Best moves match |
|---|---|---|---|---|---|---|---|---|
| 1 | Empty board | 549,946 | 20,866 | 96.21% | 7,692 | 7,788 | ✓ | ✓ |
| 2 | Early game (`[(1,1)]`, AI=O) | 55,505 | 2,459 | 95.57% | 965 | 946 | ✓ | ✓ |
| 3 | Mid game (4 moves, AI=X) | 178 | 97 | 45.51% | 26 | 20 | ✓ | ✓ |
| 4 | Immediate win available | 157 | 36 | 77.07% | 16 | 24 | ✓ | ✓ |
| 5 | Must block opponent win | 1,019 | 82 | 91.95% | 27 | 46 | ✓ | ✓ |
| 6 | Late game, 1 cell left | 2 | 2 | 0.00% | 0 | 0 | ✓ | ✓ |
| 7 | Many branches to prune (2 moves, AI=X) | 7,332 | 871 | 88.12% | 322 | 351 | ✓ | ✓ |

**Position 6 is the important negative result the Phase 6 brief asks
for:** with only one legal move remaining, there is nothing to prune —
Alpha-Beta visits exactly as many nodes as Minimax (2, matching
exactly). Alpha-Beta reduces node count *when there is a search tree
wide enough to prune*, not unconditionally on every position. This
confirms the brief's instruction not to promise a reduction on every
possible position.

## The Empty-Board Comparison (Major Benchmark)

This is the headline result, re-derived live in
`test_empty_board_matches_the_recorded_phase_5_minimax_baseline`
(which also asserts the Minimax side has not drifted from Phase 5's
recorded `549,946` nodes / `255,168` terminal nodes before comparing):

| Metric | Minimax | Alpha-Beta |
|---|---|---|
| Evaluation | `0` (draw) | `0` (draw) |
| Best move | `(0, 0)` | `(0, 0)` |
| Nodes visited | 549,946 | 20,866 |
| Terminal nodes | 255,168 | 8,453 |
| Execution time | ~16,939 ms | ~571 ms |

Node reduction: **96.21%**. Terminal-node reduction: **96.69%**.
Wall-clock speedup: **~29.7x**. Both the evaluation and the chosen
move are identical — Alpha-Beta reaches the exact same conclusion
about the opening move of Tic-Tac-Toe using about 1/26th of the
search.

## Same Value vs. Same Move vs. Same Outcome

Three different claims, each verified separately, because conflating
them would risk reporting a false failure:

1. **Same optimal value** (`evaluations_match`): guaranteed by the
   Alpha-Beta correctness theorem whenever move ordering is identical
   — pruning only skips branches that provably cannot affect the
   final value. Confirmed `True` on every tested position (benchmark
   table above, plus 10 additional positions in
   `TestConsistencyWithMinimax.test_evaluations_match_minimax_on_reachable_positions`).
2. **Same selected move** (`best_moves_match`): *not* theoretically
   guaranteed in general — several moves can share the same optimal
   value, and which one a solver reports can depend on traversal
   order. It *is* expected here specifically because both baselines
   use identical row-major ordering and an identical
   strictly-greater-than tie-break rule, which this project empirically
   verified rather than assumed:
   `TestConsistencyWithMinimax.test_best_moves_also_match_given_identical_ordering_and_tie_break`
   passed on all 10 sampled positions, and the benchmark table above
   shows it held on all 7 benchmark positions too.
3. **Same game-theoretic outcome**: confirmed independently by each
   algorithm's own exhaustive verification (never loses as X or O
   against any opponent strategy — see
   `docs/MINIMAX_IMPLEMENTATION.md` §11 and
   `docs/ALPHA_BETA_IMPLEMENTATION.md` §11) and by a direct
   Alpha-Beta-vs-Minimax self-play game, which ends in a draw.

A hypothetical future change (e.g. different tie-breaking, or a
heuristic move-ordering experiment) could make (2) diverge while (1)
and (3) stay true — that would not indicate a bug, only a different
equally-optimal choice. This project's comparison utility reports (2)
as an observation (`best_moves_match`), never as a pass/fail
correctness gate on its own.

## Complexity

Alpha-Beta does not change Minimax's worst-case asymptotic bound —
pruning's benefit is practical (how many nodes actually get visited
for a *given* position and move order), not a different algorithmic
complexity class. The benchmark table shows this directly: reduction
ranges from 0% (position 6, no tree left to prune) to over 96% (the
empty board, the largest tree). As a rule of thumb visible in the
data, reduction tends to increase with the size of the remaining
search tree — small/late-game positions have little or nothing to
prune, while the full opening tree has enormous pruning potential.

## Limitations

- These are baseline implementations: identical row-major ordering,
  no heuristic move ordering, no transposition table, no caching —
  by design, so the comparison isolates pruning's effect alone (see
  `docs/ALPHA_BETA_IMPLEMENTATION.md` §7, §12). A heuristically-ordered
  Alpha-Beta would prune more in most positions, but that is future,
  clearly-separated work, not part of this baseline.
- `best_moves_match` held on every position tested in this phase, but
  is not claimed as a general theorem — see "Same Value vs. Same Move
  vs. Same Outcome" above.
- No results in this document are hardcoded without having been
  derived from a real, reproducible `pytest -s` run first.
