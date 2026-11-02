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

**Status: Phase 2 — UI/UX Design complete.** Wireframes, interaction
flows, responsive behavior, a component inventory, and design-decision
rationale exist for all 14 planned pages. See
[docs/PAGE_WIREFRAMES.md](./docs/PAGE_WIREFRAMES.md) for the full
page-by-page design and [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the
roadmap.

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
| [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) | FastAPI REST contract for both games |
| [docs/UI_UX_DESIGN.md](./docs/UI_UX_DESIGN.md) | Master design system: tokens, navigation, dual visual theme |
| [docs/PAGE_WIREFRAMES.md](./docs/PAGE_WIREFRAMES.md) | Wireframes and layout hierarchy for all 14 pages |
| [docs/INTERACTION_FLOWS.md](./docs/INTERACTION_FLOWS.md) | User journeys and element-level interaction states |
| [docs/RESPONSIVE_DESIGN.md](./docs/RESPONSIVE_DESIGN.md) | Breakpoints and desktop/tablet/mobile behavior |
| [docs/COMPONENT_INVENTORY.md](./docs/COMPONENT_INVENTORY.md) | Proposed reusable components and responsibilities |
| [docs/DESIGN_DECISIONS.md](./docs/DESIGN_DECISIONS.md) | Key design decisions, rationale, and trade-offs |
| [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) | Pytest / Vitest coverage plan |

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
