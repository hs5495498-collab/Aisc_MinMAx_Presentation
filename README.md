# Competitive AI Game Lab

> Formerly scoped as "TicTacToe AI Lab" — expanded in Phase 1A into a
> two-game platform for exploring classical adversarial search and
> game-theoretic reasoning.

## Purpose

Competitive AI Game Lab is an interactive educational platform for
exploring how AI opponents reason under two different models of
competition:

- **Perfect-information, sequential games** (Tic-Tac-Toe), solved with
  Minimax and Alpha-Beta Pruning, where a player can watch the AI
  "think" by visualizing its search tree.
- **Simultaneous-action, zero-sum games** (Rock Paper Scissors), solved
  with game-theoretic mixed-strategy equilibrium analysis, where a
  player can see *why* no single deterministic move is ever optimal.

Neither game has been implemented yet. This repository currently
contains architecture, UI/UX design, and planning documentation only.

**Status: Phase 10 — RPS Strategy Visualization and Interactive Game
Theory Lab complete.** The RPS Strategy Matrix page
(`/labs/rps-matrix`) is now a six-tab interactive lab — Payoff Matrix,
Mixed Strategy Explorer, Expected Payoff Calculator, Best Response
Lab, Nash Equilibrium Explorer, and Exploitability Demonstration — all
computed live from player-adjustable probabilities via
`frontend/src/lib/rpsGameTheory.ts`, a verified TypeScript mirror of
Phase 8's `analysis.py`/`equilibrium.py` (parity cross-checked against
the real Python engine's output, not just hand-derived). Invalid
probability distributions are never silently normalized; an explicit
"Normalize to sum 1" action is the only rescaling path. See
[docs/RPS_STRATEGY_VISUALIZATION.md](./docs/RPS_STRATEGY_VISUALIZATION.md).
No new backend game-theory mathematics or FastAPI layer was
introduced; Phase 8 remains the sole mathematical source of truth.

**Phase 9 — RPS Interactive Gameplay (human vs. AI) complete.**
A full human-vs-AI Rock Paper Scissors match is playable end to
end on the dashboard theme: best-of-3/5/7/custom match configuration,
four selectable AI strategies (Nash/uniform, random, custom mixed,
biased demonstration), round-by-round reveal, scoreboard, match
history, and a final result screen. Simultaneous-action fairness is
enforced structurally — the AI's action for a round is sampled only
after the player's move is locked, never exposed before
(`backend/app/games/rock_paper_scissors/{ai_strategies.py,match.py,
session.py}`, mirrored by `frontend/src/lib/rpsEngine.ts` as a
clearly-labeled frontend demo pending Phase 12's API). See
[docs/RPS_GAMEPLAY.md](./docs/RPS_GAMEPLAY.md). Human-vs-human play
remains out of scope; no FastAPI layer exists yet.

**Phase 8 — RPS Strategy Engine complete.** A pure-Python,
game-theory-only engine (`backend/app/games/rock_paper_scissors/`)
implements standard Rock Paper Scissors's payoff matrix, mixed
strategies, expected payoff, best response, Nash equilibrium (derived
from a symmetry argument, with an exact-rational proof via
`fractions.Fraction`, not a hardcoded constant), and exploitability.
Standard RPS is simultaneous-action and zero-sum — this engine never
uses Minimax/Alpha-Beta or any alternating-turn search; see
[docs/RPS_STRATEGY_ENGINE.md](./docs/RPS_STRATEGY_ENGINE.md) and
[docs/GAME_THEORY_DESIGN.md](./docs/GAME_THEORY_DESIGN.md).

**Phase 7 — Search-Tree Visualization complete.** The Minimax
Explorer, Alpha-Beta Explorer, and Search Tree Lab pages now replay
*real* recorded searches — step through actual MAX/MIN value backup,
alpha/beta updates, and Alpha-Beta cutoffs event-by-event, with
play/pause/speed controls, node inspection, and a side-by-side
Minimax-vs-Alpha-Beta comparison. No search tree is fabricated: a
backend adapter (`backend/app/algorithms/visualization/`) converts the
real Phase 5/6 solver observer events into replayable data, generated
offline into static fixtures (no FastAPI layer exists yet). See
[docs/SEARCH_TREE_VISUALIZATION.md](./docs/SEARCH_TREE_VISUALIZATION.md).
Phase 6's Alpha-Beta Pruning search (`backend/app/algorithms/alpha_beta/`)
still runs alongside Phase 5's unpruned Minimax baseline, sharing the
exact same evaluator, move ordering, and validation rules — on the
empty board it visits 20,866 nodes versus Minimax's 549,946 (96.21%
fewer) while returning the identical evaluation and best move; full
benchmark in [docs/ALGORITHM_COMPARISON.md](./docs/ALGORITHM_COMPARISON.md).
The Phase 3 game pages (`frontend/`) still use their own
clearly-labeled random demo opponent; the real algorithms are not
wired into actual gameplay yet. See
[docs/ALPHA_BETA_IMPLEMENTATION.md](./docs/ALPHA_BETA_IMPLEMENTATION.md),
[docs/MINIMAX_IMPLEMENTATION.md](./docs/MINIMAX_IMPLEMENTATION.md), and
[docs/TIC_TAC_TOE_ENGINE.md](./docs/TIC_TAC_TOE_ENGINE.md) for the
backend, [frontend/README.md](./frontend/README.md) and
[docs/FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md) for
the frontend, and [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the roadmap.

## Games

### Game 1 — Tic-Tac-Toe
Human vs. AI and human vs. human play, with selectable AI search
strategy (Minimax, Alpha-Beta, ordered Alpha-Beta, unordered
Alpha-Beta), difficulty levels, move history, undo/restart, and a
recursive search-tree visualization showing MAX/MIN evaluation,
alpha/beta updates, and pruning explanations, plus performance
comparison across strategies.

### Game 2 — Rock Paper Scissors
Human vs. AI and human vs. human play, round-based with scoreboard and
match history, best-of-3/5/10 formats, selectable AI strategy, a
payoff-matrix view, and mixed-strategy equilibrium / probability
visualization. See
[`docs/GAME_THEORY_DESIGN.md`](./docs/GAME_THEORY_DESIGN.md) for why
standard simultaneous RPS is **not** solved by alternating-turn
Alpha-Beta, and for the separately labeled educational sequential
variant that *is*.

## Documentation

| Document | Covers |
|---|---|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Full phased roadmap with acceptance criteria |
| [docs/SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) | Overall system/module architecture |
| [docs/GAME_ENGINE_DESIGN.md](./docs/GAME_ENGINE_DESIGN.md) | Shared and per-game engine design |
| [docs/ALGORITHM_DESIGN.md](./docs/ALGORITHM_DESIGN.md) | Minimax / Alpha-Beta variants, difficulty |
| [docs/SEARCH_VISUALIZATION_DESIGN.md](./docs/SEARCH_VISUALIZATION_DESIGN.md) | Search-event schema and tree visualization |
| [docs/ROCK_PAPER_SCISSORS_DESIGN.md](./docs/ROCK_PAPER_SCISSORS_DESIGN.md) | RPS gameplay, strategies, data model |
| [docs/GAME_THEORY_DESIGN.md](./docs/GAME_THEORY_DESIGN.md) | Payoff matrix, Nash equilibrium, exploitability |
| [docs/RPS_STRATEGY_ENGINE.md](./docs/RPS_STRATEGY_ENGINE.md) | As-built RPS engine: mixed strategies, equilibrium derivation, exploitability |
| [docs/RPS_GAMEPLAY.md](./docs/RPS_GAMEPLAY.md) | As-built RPS gameplay: match engine, AI strategies, simultaneous-action fairness, frontend |
| [docs/RPS_STRATEGY_VISUALIZATION.md](./docs/RPS_STRATEGY_VISUALIZATION.md) | As-built RPS Strategy Lab: payoff matrix, mixed strategy, expected payoff, best response, equilibrium, exploitability |
| [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) | FastAPI REST contract for both games |
| [docs/UI_UX_DESIGN.md](./docs/UI_UX_DESIGN.md) | Master design system: tokens, navigation, dual visual theme |
| [docs/PAGE_WIREFRAMES.md](./docs/PAGE_WIREFRAMES.md) | Wireframes and layout hierarchy for all 14 pages |
| [docs/INTERACTION_FLOWS.md](./docs/INTERACTION_FLOWS.md) | User journeys and element-level interaction states |
| [docs/RESPONSIVE_DESIGN.md](./docs/RESPONSIVE_DESIGN.md) | Breakpoints and desktop/tablet/mobile behavior |
| [docs/COMPONENT_INVENTORY.md](./docs/COMPONENT_INVENTORY.md) | Proposed reusable components and responsibilities |
| [docs/DESIGN_DECISIONS.md](./docs/DESIGN_DECISIONS.md) | Key design decisions, rationale, and trade-offs |
| [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) | Pytest / Vitest coverage plan |
| [docs/FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md) | As-built frontend structure, dependencies, and theme implementation |
| [docs/TIC_TAC_TOE_ENGINE.md](./docs/TIC_TAC_TOE_ENGINE.md) | As-built Tic-Tac-Toe engine: state model, rules, exceptions, testing |
| [docs/MINIMAX_IMPLEMENTATION.md](./docs/MINIMAX_IMPLEMENTATION.md) | As-built Minimax: theory, scoring, statistics, exhaustive verification |
| [docs/ALPHA_BETA_IMPLEMENTATION.md](./docs/ALPHA_BETA_IMPLEMENTATION.md) | As-built Alpha-Beta: pruning conditions, statistics, observer events |
| [docs/ALGORITHM_COMPARISON.md](./docs/ALGORITHM_COMPARISON.md) | Minimax vs. Alpha-Beta benchmark results and methodology |
| [docs/SEARCH_TREE_VISUALIZATION.md](./docs/SEARCH_TREE_VISUALIZATION.md) | Search-tree visualization: event flow, playback, performance strategy |

## Navigation Map (Planned)

- **Dashboard**
- **Games** — Tic-Tac-Toe, Rock Paper Scissors
- **Algorithm Labs** — Minimax Explorer, Alpha-Beta Explorer, Search Tree Lab, RPS Strategy Matrix
- **Insights** — Algorithm Comparison, Performance Analytics, Simulation History
- **Learning** — Minimax Tutorial, Alpha-Beta Tutorial, RPS Game Theory, Interactive Viva Preparation

## Tech Stack (Planned)

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, Framer Motion, Recharts, Vitest |
| Backend    | Python, FastAPI, Pytest             |
| Algorithms | Minimax, Alpha-Beta Pruning, Game-Theoretic Mixed-Strategy Analysis |

## Visual Design

Two coordinated themes, detailed in
[docs/UI_UX_DESIGN.md](./docs/UI_UX_DESIGN.md):

- **Graph theme** (dark navy/black, glowing cyan/purple nodes and
  edges, zoom/pan, node inspection) — used for algorithm search-tree
  visualizations.
- **Dashboard theme** (deep violet gradient, glassmorphism cards,
  purple/magenta/cyan/teal accents) — used for dashboards, gameplay
  pages, and comparison analytics.

## Relationship to Prior Work

This is a ground-up rewrite, independent of any previous Tic-Tac-Toe or
Minimax project. No source code was carried over from earlier projects.

## Getting Started

Setup instructions will be added once the backend and frontend
scaffolding exist (see Phase 2 onward in [PROJECT_PLAN.md](./PROJECT_PLAN.md)).
