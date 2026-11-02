# Competitive AI Game Lab — Frontend

Phase 3 implementation: the full React application shell, navigation,
and all 14 pages from `docs/PAGE_WIREFRAMES.md`, with the two permanent
visual themes from `docs/UI_UX_DESIGN.md`. No game engine, algorithms,
or backend — see "Known placeholder functionality" below and
[`../docs/FRONTEND_ARCHITECTURE.md`](../docs/FRONTEND_ARCHITECTURE.md).

## Stack

React 19 · Vite 8 · TypeScript (strict) · Tailwind CSS v4 ·
React Router v7 · Framer Motion · Lucide React · Recharts · Vitest +
React Testing Library.

## Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server (default port 5173) |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run Oxlint |

## Structure

See [`../docs/FRONTEND_ARCHITECTURE.md`](../docs/FRONTEND_ARCHITECTURE.md)
for the full breakdown of `src/app`, `src/components`, `src/features`,
`src/hooks`, `src/lib`, `src/styles`, and `src/types`.

## Known placeholder functionality

- The Tic-Tac-Toe and Rock Paper Scissors "AI" opponents pick randomly
  among valid options — not Minimax, Alpha-Beta, or a Nash-equilibrium
  engine. This is labeled in the UI itself, not just here.
- Algorithm Lab graph canvases show a static illustrative example tree,
  clearly labeled as such — never a fabricated "real" execution.
- Execution transport controls (play/pause/step/speed) in the
  Algorithm Labs are present but disabled, with a tooltip explaining
  they activate once the real search engine ships.
- Simulation History, Performance Analytics, and Dashboard statistics
  show sample data, labeled with a "Sample data" notice.
- Simulation History's "Replay" action is disabled with an explanatory
  tooltip — replay requires persistence that doesn't exist yet.
- Settings (reduced motion / sound / density) persist to
  `localStorage` but are not yet wired into actual gameplay behavior.
