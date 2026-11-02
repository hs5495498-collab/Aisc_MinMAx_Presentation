# Project Plan — Competitive AI Game Lab

> Roadmap for a two-game competitive AI platform (Tic-Tac-Toe +
> Rock Paper Scissors). Phase 0 and Phase 1 are complete; Phase 1A
> (this phase) expands the architecture to two games before any game
> code is written. Phases 2 onward are implementation and remain
> unstarted.

## Phase 0 — Environment and Project Setup *(completed)*
Independent project directory created, development environment
inspected, GitHub preparation reviewed. No application code.

**Acceptance criteria:**
- New project directory exists, independent of prior projects.
- Required tools (Git, GitHub CLI, Python, Node, npm) verified installed.
- No commits, pushes, or deletions of prior repositories.

## Phase 1 — Initial Architecture *(completed)*
Baseline single-game (Tic-Tac-Toe) technical blueprint established.

**Acceptance criteria:**
- Initial README and project plan describing a Minimax/Alpha-Beta
  Tic-Tac-Toe simulator exist.
- No game code written yet.

## Phase 1A — Two-Game Architecture Expansion *(this phase)*
Expand the single-game blueprint into a two-game platform (Tic-Tac-Toe
+ Rock Paper Scissors) with a unified navigation/design system, full
architecture documentation set, and initial publication to the new
GitHub repository.

**Acceptance criteria:**
- `docs/` contains updated architecture, game engine, algorithm,
  search-visualization, API, UI/UX, and testing documents, plus new
  RPS and game-theory design documents.
- RPS is documented with a mathematically correct simultaneous-action
  payoff matrix and mixed-strategy equilibrium, clearly distinguished
  from a separately labeled educational sequential Alpha-Beta variant.
- Documentation published to `https://github.com/hs5495498-collab/Aisc_MinMAx_Presentation`
  on `main`, with no application code committed.
- No prior repositories modified or deleted.

## Phase 2 — UI/UX Design *(completed)*
Finalize wireframes/mockups for both visual themes (graph theme,
dashboard theme) across every page in the navigation map.

**Acceptance criteria:**
- Mockups or detailed specs exist for Dashboard, both game pages, all
  four Algorithm Labs, all three Insights pages, and all four Learning
  pages. — Met: see `docs/PAGE_WIREFRAMES.md` (all 14 pages).
- Theme usage (graph vs. dashboard) is consistent with
  `docs/UI_UX_DESIGN.md`. — Met: token-level design system, route/theme
  table, and per-page theme labels are consistent across
  `UI_UX_DESIGN.md` and `PAGE_WIREFRAMES.md`.

**Design-only deliverables added this phase:** `docs/UI_UX_DESIGN.md`
(master design system), `docs/PAGE_WIREFRAMES.md`,
`docs/INTERACTION_FLOWS.md`, `docs/RESPONSIVE_DESIGN.md`,
`docs/COMPONENT_INVENTORY.md`, `docs/DESIGN_DECISIONS.md`. No
application code, components, or dependencies were introduced.

## Phase 3 — React Frontend Foundation *(completed)*
Scaffold the React + Vite + Tailwind CSS + Framer Motion application
shell with routing matching the navigation map, but no game logic.

**Acceptance criteria:**
- App builds and runs with empty/placeholder pages for every route. —
  Met: all 14 routes implemented with distinct, wireframe-matched
  layouts (not empty placeholders); `npm run build` (strict `tsc -b` +
  `vite build`) passes with zero errors.
- Shared layout, navigation, and theme providers in place. — Met:
  `AppShell`/`PageContainer`/`Sidebar`/`MobileTabBar`/`Topbar` plus the
  token-driven Dashboard/Graph theme system in `frontend/src/styles/tokens.css`.

**Implementation details:** see `frontend/README.md` and
`docs/FRONTEND_ARCHITECTURE.md`. No Minimax, Alpha-Beta, RPS strategy
engine, or backend code was introduced — Tic-Tac-Toe and Rock Paper
Scissors use a clearly-labeled random demo opponent only, and all
sample statistics/history are labeled as demo data.

## Phase 4 — Tic-Tac-Toe Game Engine *(completed)*
Implement pure-Python Tic-Tac-Toe rules: board state, move validation,
win/draw detection, move history, undo/restart.

**Acceptance criteria:**
- Engine passes unit tests for all terminal states and illegal moves.
  — Met: 56/56 Pytest tests pass, covering all 8 winning lines for
  both X and O, two distinct draw layouts, and every exception type.
- Human vs. human play works end-to-end through the engine (no AI).
  — Met: `TicTacToeGame.make_move()` alternates turns with no AI
  involved; verified via the test suite and a manual demo script.

**Implementation details:** see `backend/README.md` and
`docs/TIC_TAC_TOE_ENGINE.md`. No Minimax, Alpha-Beta, FastAPI, or
database code was introduced — pure rules only, importable directly
from Python (`from app.games.tic_tac_toe import TicTacToeGame`).

## Phase 5 — Minimax Implementation *(completed)*
Implement baseline Minimax search for Tic-Tac-Toe.

**Acceptance criteria:**
- Minimax never loses as the AI player from any reachable state. —
  Met: exhaustive verification (branching over every opponent move at
  every opponent turn, for both AI=X and AI=O) found zero losses; a
  separate Minimax-vs-Minimax self-play game ends in a draw, as
  expected.
- Node-visit count is recorded per decision. — Met: `MinimaxResult`
  carries `nodes_visited`, `terminal_nodes`, `leaves_evaluated`,
  `moves_considered`, `maximum_search_depth`, `execution_time_ms`.
  A search from the empty board visits exactly 549,946 nodes / 255,168
  terminal leaves — the independently-known totals for the full
  Tic-Tac-Toe game tree.

**Implementation details:** see `docs/MINIMAX_IMPLEMENTATION.md`. No
Alpha-Beta Pruning, FastAPI, or frontend changes were introduced.
83/83 backend tests pass (56 engine + 27 Minimax).

## Phase 6 — Alpha-Beta Implementation *(completed, baseline scope)*
Implement standard Alpha-Beta Pruning as a fair, same-move-ordering
baseline against Minimax, with detailed pruning statistics and a
comparison utility.

**Note on scope:** the detailed Phase 6 instructions actually received
for this phase explicitly scoped it to **one baseline implementation**
using identical row-major ordering to Minimax (so the Phase 5/6
comparison isolates pruning alone), and asked that any heuristic
move-ordering variant be a separate, clearly-labeled, disabled-by-default
experimental mode — not built in this phase. This supersedes this
document's earlier "ordered and unordered variants" framing from
Phase 1A, before Phase 6's actual acceptance criteria were specified.

**Acceptance criteria (as actually specified for this phase):**
- Alpha-Beta produces the same move choice as Minimax on identical
  inputs, with fewer or equal nodes explored. — Met: verified on the
  required 7-position benchmark plus 10 additional sampled positions;
  evaluations matched on every position tested, best moves matched on
  every position tested, and `alpha_beta_nodes_visited <= minimax_nodes_visited`
  held on every position (with equality, not reduction, on the
  1-legal-move late-game position, where there is nothing to prune).
- Pruning is instrumented with precise, internally-consistent
  statistics. — Met: `alpha_beta_cutoffs` and `branches_pruned` are
  tracked as distinct counts and verified, via an observer, to match
  the literal number of real cutoff/pruning events that occurred.

**Implementation details:** see `docs/ALPHA_BETA_IMPLEMENTATION.md`
and `docs/ALGORITHM_COMPARISON.md`. Neither the Phase 5 Minimax module
nor the Phase 4 game engine was modified. 149/149 backend tests pass
(56 engine + 27 Minimax + 48 Alpha-Beta + 18 comparison/benchmark).

## Phase 7 — Tic-Tac-Toe Search-Tree Visualization *(completed)*
Build the interactive recursive search-tree view (MAX/MIN evaluation,
alpha/beta updates, pruning explanations) using the graph theme.

**Acceptance criteria:**
- Every explored node and every pruned branch is represented in the
  visualization, with zoom/pan and node inspection. — Met: a
  `TreeBuildingObserver` adapter converts real Minimax/Alpha-Beta
  observer events into a replayable tree (no fabricated nodes/values);
  pruned branches render as stubs with no board/evaluation/children,
  never implying they were evaluated; pan/zoom and a node inspector
  with human-readable explanations are implemented and tested.

**Implementation details:** see `docs/SEARCH_TREE_VISUALIZATION.md`.
No FastAPI, RPS, or engine/Minimax/Alpha-Beta algorithm changes were
introduced — the visualization adapter only observes existing solver
events. 176/176 backend tests pass (149 prior + 27 new); 43/43
frontend tests pass. Real search data for the shipped demo positions
is pre-generated offline (`backend/scripts/generate_visualization_fixtures.py`)
since no backend API exists yet; the empty board's 549,946-node tree
is intentionally not shipped as a bundled fixture (see the doc's
"Known Limitations").

## Phase 8 — RPS Strategy Engine
Implement the RPS payoff matrix, round resolution, best-of-N match
logic, and AI strategy selection (including the uniform mixed-strategy
equilibrium strategy).

**Acceptance criteria:**
- Round resolution is correct for all 9 choice combinations.
- Best-of-3/5/10 match completion logic is correct.
- Default AI strategy plays each option with probability 1/3.

## Phase 9 — RPS Interactive Gameplay
Build human vs. AI and human vs. human RPS gameplay pages with
scoreboard and match history, using the dashboard theme.

**Acceptance criteria:**
- Full best-of-N match playable end-to-end for both modes.
- Match history and scoreboard persist for the duration of a session.

## Phase 10 — RPS Strategy Visualization
Build the payoff-matrix view and mixed-strategy/probability
visualization (equilibrium probabilities, expected value, exploitability).

**Acceptance criteria:**
- Payoff matrix and equilibrium probabilities render correctly for the
  standard game and update if a biased/adaptive AI strategy is selected.

## Phase 11 — Sequential RPS Alpha-Beta Educational Demonstration
Implement the separately labeled sequential-reveal variant of RPS as a
pedagogical tool for visualizing Alpha-Beta search mechanics in a
3-branch game, explicitly distinguished from standard RPS.

**Acceptance criteria:**
- UI clearly labels this mode as "Educational — Sequential Variant,
  Not Standard RPS" wherever it appears.
- Reuses the Phase 7 search-tree visualization component.

## Phase 12 — Unified FastAPI Backend
Expose both games through one FastAPI application with consistent
routing, schemas, and session handling.

**Acceptance criteria:**
- `/api/v1/tic-tac-toe/*` and `/api/v1/rps/*` match
  `docs/API_SPECIFICATION.md`.
- Shared error-response schema across both games.

## Phase 13 — Algorithm Comparison and Analytics
Build the Insights section: algorithm comparison, performance
analytics, and simulation history, using Recharts.

**Acceptance criteria:**
- Minimax vs. Alpha-Beta (ordered/unordered) comparison charts use
  real instrumentation data, not placeholders.
- Simulation history is queryable and persists across a session.

## Phase 14 — Learning Centre
Build the four Learning pages (Minimax Tutorial, Alpha-Beta Tutorial,
RPS Game Theory, Interactive Viva Preparation).

**Acceptance criteria:**
- Each tutorial page links to and is consistent with its corresponding
  design document.
- Viva Preparation includes interactive Q&A covering both games.

## Phase 15 — Testing and Optimization
Complete Pytest and Vitest suites per `docs/TESTING_STRATEGY.md`;
profile and optimize slow paths (deep Minimax searches, render
performance of the tree visualization).

**Acceptance criteria:**
- Backend and frontend coverage thresholds defined in
  `docs/TESTING_STRATEGY.md` are met.
- No known performance regression in search-tree rendering at maximum
  Tic-Tac-Toe search depth.

## Phase 16 — Documentation, GitHub Release and Deployment
Finalize all documentation, tag a release, and prepare deployment
configuration.

**Acceptance criteria:**
- All docs reflect the as-built system (no planned/unimplemented
  features described as done).
- A tagged release exists on the GitHub repository with deployment
  instructions.
