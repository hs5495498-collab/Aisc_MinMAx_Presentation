# Testing Strategy

## Backend — Pytest

### Tic-Tac-Toe Engine
- Win detection for all 8 winning lines, both players.
- Draw detection on a full, unwon board.
- Illegal move rejection (occupied cell, out-of-turn, out-of-range).
- Undo restores the exact prior board and turn; restart clears history.

### Minimax / Alpha-Beta
- **Correctness-equivalence:** for a fixed suite of board states,
  Minimax, Alpha-Beta (unordered), and Alpha-Beta (ordered) must all
  return the same move (or a move of equal evaluated value when ties
  exist).
- **Optimality:** AI playing "hard" difficulty from an empty board or
  any reachable state never loses.
- **Pruning correctness:** Alpha-Beta's node count is always ≤
  Minimax's node count on the same input.
- **Ordering effect:** ordered Alpha-Beta's node count is ≤ unordered
  Alpha-Beta's node count, averaged over a fixed set of midgame states.
- **Difficulty behavior:** easy/medium difficulty respects the
  documented depth cap or randomization-among-top-K behavior.

### RPS Engine
- Round resolution correctness for all 9 `(human, opponent)` choice
  pairs.
- Best-of-3/5/10 match completion triggers at the correct win count,
  and not earlier.
- Scoreboard and round history stay consistent with resolved rounds.

### Game Theory Service
- Payoff matrix matches the table in `GAME_THEORY_DESIGN.md` exactly.
- `nash_uniform` strategy sampling converges to `(1/3, 1/3, 1/3)` within
  tolerance over a large number of trials.
- Expected value of the uniform strategy against any fixed pure
  opponent strategy is `0` within tolerance.
- `pattern_adaptive` strategy achieves positive expected value against
  a `biased_fixed` opponent over repeated matches (demonstrates
  exploitability).

### API Layer
- Each endpoint in `API_SPECIFICATION.md` has a test for its documented
  success response and at least one documented error case.
- Session/match not-found and already-complete cases return the
  correct error codes.

## Frontend — Vitest

### Components
- Tic-Tac-Toe board renders correct cell states and disables
  interaction when it's not the human's turn or the game is complete.
- RPS choice buttons and round-result animation render correctly for
  win/loss/tie.
- Search-tree graph component renders the correct node/edge count for
  a given fixed search-event fixture, and correctly marks pruned nodes.

### Hooks / Services
- Game-session hooks correctly reflect optimistic vs. server-confirmed
  state after a move/round submission.
- API service layer correctly maps backend error schema to UI-facing
  error states.

### Theme Consistency
- Snapshot/visual-regression style tests confirm graph-theme pages and
  dashboard-theme pages use their assigned theme per the route table in
  `UI_UX_DESIGN.md`.

## Coverage Targets

| Area | Target |
|---|---|
| Backend engines + algorithms | ≥ 90% line coverage |
| Backend API layer | ≥ 80% line coverage |
| Frontend components/hooks | ≥ 75% line coverage |

## Non-Functional Checks

- Full-depth Minimax search on an empty Tic-Tac-Toe board completes
  within an agreed latency budget (documented performance baseline
  established in Phase 15, not before — no application code exists
  yet to benchmark).
- No test relies on wall-clock timing thresholds tighter than what is
  achievable reliably in CI; node-count assertions are preferred over
  timing assertions wherever both are possible.
